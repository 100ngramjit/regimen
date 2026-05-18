import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WorkoutRequestSchema, WorkoutSchema } from '@/lib/schemas';
import { generateFallbackWorkout } from '@/lib/rule-engine';
import { rateLimit } from '@/lib/rate-limit';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { workouts } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

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
    // Serve fallback silently instead of 429 — user still gets a workout
    try {
      const body = await req.json();
      const data = WorkoutRequestSchema.parse(body);
      const fallback = generateFallbackWorkout(data);
      
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    } catch {
      const fallback = generateFallbackWorkout({});
      
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    }
  }
  let validatedData;
  try {
    const body = await req.json();
    validatedData = WorkoutRequestSchema.parse(body);

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey.includes('your_ai_api_key_here')) {
      console.warn('Gemini API key not found, using fallback.');
      const fallback = generateFallbackWorkout(validatedData);
      
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
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `You are a certified fitness coach.
Generate a professional workout plan based on the user input.

Constraints:
- Return ONLY valid JSON.
- No explanations or text outside the JSON.
- Keep total duration within the requested limit.
- Include Warm-up, Main Workout, and Cool-down sections.
- Ensure exercises are appropriate for the user's level and equipment.

Schema:
{
  "title": "Workout Title",
  "totalTime": "Duration in mins",
  "sections": [
    {
      "name": "Warm-up",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": "e.g. 3",
          "duration": "e.g. 30s",
          "reps": "e.g. 10",
          "rest": "e.g. 15s",
          "instructions": "Simple tip"
        }
      ]
    }
  ]
}`;

    const focusText = validatedData.focus && validatedData.focus.length > 0
      ? validatedData.focus.join(', ')
      : 'Full Body';

    const userPrompt = `Generate a workout with these details:
         Goal: ${validatedData.goal || 'General fitness'}
         Muscle Focus: ${focusText}
         Duration: ${validatedData.duration || 30} mins
         Equipment: ${validatedData.equipment || 'None'}
         Level: ${validatedData.level || 'Beginner'}
         Additional Notes: ${validatedData.notes || 'None'}

IMPORTANT: The workout MUST be centered around the ${focusText} muscle groups. Select exercises that primarily target these muscle groups.`;

    const startTime = Date.now();
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    let content = response.text();
    
    console.log(`Gemini completion took ${Date.now() - startTime}ms`);

    if (!content) {
      throw new Error('Empty response from Gemini');
    }

    // Clean markdown code blocks if present
    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    try {
      const aiResponse = JSON.parse(content);
      const validatedWorkout = WorkoutSchema.parse(aiResponse);

      // Save to DB
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(validatedWorkout),
      });

      return NextResponse.json(validatedWorkout);
    } catch (parseError) {
      console.warn('AI parse/validation error, using fallback:', parseError);
      const fallback = generateFallbackWorkout(validatedData);
      
      // Save fallback to DB as well so it counts towards the limit
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error('API Error:', error);
    if (validatedData) {
      const fallback = generateFallbackWorkout(validatedData);
      
      // Even on major error, if we serve a workout, we count it? 
      // Actually, if it's an "unexpected error" we might not want to count it if it's a 500.
      // But generateFallbackWorkout usually works.
      
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
