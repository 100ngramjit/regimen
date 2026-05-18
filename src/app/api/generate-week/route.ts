import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeeklyPlanRequestSchema, WeeklyPlanSchema, DayPlanConfig } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { workouts } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { buildWeeklyFallback } from '@/lib/rule-engine';
import { getWeeklyPlanPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  const { user } = await withAuth();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Check daily limit for the user
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userWorkoutsToday = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, user.id),
        gte(workouts.createdAt, today)
      )
    );

  if (userWorkoutsToday.length >= 2) {
    return NextResponse.json({ 
      error: 'Daily limit reached', 
      message: 'You can only generate 2 workouts per day.' 
    }, { status: 429 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded', 
      message: 'Too many requests. Please try again in a minute.' 
    }, { status: 429 });
  }

  let validatedData;
  try {
    const body = await req.json();
    validatedData = WeeklyPlanRequestSchema.parse(body);
  } catch (err) {
    return NextResponse.json({ 
      error: 'Invalid request', 
      message: err instanceof Error ? err.message : 'Invalid request payload.' 
    }, { status: 400 });
  }

  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey.includes('your_ai_api_key_here')) {
      console.warn('Gemini API key not found. Using fallback weekly plan.');
      const fallback = buildWeeklyFallback(validatedData.schedule, validatedData.goal);
      
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.AI_MODEL || "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = getWeeklyPlanPrompt(validatedData);

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();
    console.log(`Weekly plan generation took ${Date.now() - startTime}ms`);

    if (!content) throw new Error('Empty response from Gemini');

    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    const aiResponse = JSON.parse(content);
    const validatedPlan = WeeklyPlanSchema.parse(aiResponse);

    // Save to DB
    await db.insert(workouts).values({
      id: crypto.randomUUID(),
      userId: user.id,
      content: JSON.stringify(validatedPlan),
    });

    return NextResponse.json(validatedPlan);

  } catch (error) {
    console.warn('Weekly Gemini API or validation failed. Falling back to rule engine.', error);
    try {
      const fallback = buildWeeklyFallback(validatedData.schedule, validatedData.goal);
      
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    } catch (fallbackError) {
      console.error('Weekly fallback generation also failed:', fallbackError);
      return NextResponse.json({ 
        error: 'Failed to generate weekly plan', 
        message: 'Both AI generation and fallback generation failed.' 
      }, { status: 500 });
    }
  }
}
