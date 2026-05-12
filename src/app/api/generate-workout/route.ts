import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WorkoutRequestSchema, WorkoutSchema } from '@/lib/schemas';
import { generateFallbackWorkout } from '@/lib/rule-engine';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!rateLimit(ip, 10, 60_000)) {
    // Serve fallback silently instead of 429 — user still gets a workout
    try {
      const body = await req.json();
      const data = WorkoutRequestSchema.parse(body);
      return NextResponse.json(generateFallbackWorkout(data));
    } catch {
      return NextResponse.json(generateFallbackWorkout({}));
    }
  }
  let validatedData;
  try {
    const body = await req.json();
    validatedData = WorkoutRequestSchema.parse(body);

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey.includes('your_ai_api_key_here')) {
      console.warn('Gemini API key not found, using fallback.');
      return NextResponse.json(generateFallbackWorkout(validatedData));
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

    const userPrompt = `Generate a workout with these details:
         Goal: ${validatedData.goal || 'General fitness'}
         Duration: ${validatedData.duration || 30} mins
         Equipment: ${validatedData.equipment || 'None'}
         Level: ${validatedData.level || 'Beginner'}
         Additional Notes: ${validatedData.notes || 'None'}`;

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
      return NextResponse.json(validatedWorkout);
    } catch (parseError) {
      console.warn('AI parse/validation error, using fallback:', parseError);
      return NextResponse.json(generateFallbackWorkout(validatedData));
    }
  } catch (error) {
    console.error('API Error:', error);
    if (validatedData) {
      return NextResponse.json(generateFallbackWorkout(validatedData));
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
