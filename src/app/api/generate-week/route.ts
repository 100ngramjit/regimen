import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeeklyPlanRequestSchema, WeeklyPlanSchema, DayPlanConfig } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { workouts } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

type Ex = { name: string; sets: string; reps?: string | null; duration?: string | null; rest: string; instructions: string };

const FOCUS_EXERCISES: Record<string, Ex[]> = {
  Push: [
    { name: 'Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Full range, chest to floor' },
    { name: 'Dumbbell Overhead Press', sets: '3', reps: '12', rest: '60s', instructions: 'Press straight up, lock out' },
    { name: 'Tricep Dips', sets: '3', reps: '12', rest: '45s', instructions: 'Keep elbows tucked, full range' },
    { name: 'Incline Push-ups', sets: '3', reps: '15', rest: '45s', instructions: 'Hands elevated, target upper chest' },
  ],
  Pull: [
    { name: 'Pull-ups / Band-assisted Pull-ups', sets: '4', reps: '8', rest: '75s', instructions: 'Full dead hang to chin over bar' },
    { name: 'Dumbbell Bent-over Row', sets: '4', reps: '12', rest: '60s', instructions: 'Hinge 45°, row to hip' },
    { name: 'Face Pulls', sets: '3', reps: '15', rest: '45s', instructions: 'External rotation at end of pull' },
    { name: 'Dumbbell Bicep Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Full extension at bottom' },
  ],
  Legs: [
    { name: 'Barbell / Goblet Squat', sets: '4', reps: '10', rest: '90s', instructions: 'Hit depth, drive knees out' },
    { name: 'Romanian Deadlift', sets: '4', reps: '10', rest: '75s', instructions: 'Hinge hips, feel hamstring stretch' },
    { name: 'Walking Lunges', sets: '3', reps: '12', rest: '60s', instructions: 'Each leg, long stride' },
    { name: 'Calf Raises', sets: '4', reps: '20', rest: '30s', instructions: 'Full range, pause at top' },
  ],
  'Full Body': [
    { name: 'Burpees', sets: '4', reps: '10', rest: '45s', instructions: 'Explosive jump, controlled descent' },
    { name: 'Dumbbell Thruster', sets: '4', reps: '10', rest: '60s', instructions: 'Squat into press in one motion' },
    { name: 'Renegade Rows', sets: '3', reps: '8', rest: '60s', instructions: 'Each arm, keep hips square' },
    { name: 'Jump Squats', sets: '3', reps: '12', rest: '45s', instructions: 'Land softly, immediate next rep' },
  ],
  'Upper Body': [
    { name: 'Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Chest to floor, explosive up' },
    { name: 'Dumbbell Row', sets: '4', reps: '12', rest: '60s', instructions: 'Each arm, elbow to ceiling' },
    { name: 'Overhead Press', sets: '3', reps: '10', rest: '75s', instructions: 'Engage core, press through ceiling' },
    { name: 'Bicep Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Supinate wrist at top' },
  ],
  'Lower Body': [
    { name: 'Squat', sets: '4', reps: '12', rest: '75s', instructions: 'Chest up, knees tracking toes' },
    { name: 'Hip Thrust', sets: '4', reps: '15', rest: '60s', instructions: 'Drive through heels, squeeze glutes' },
    { name: 'Leg Press', sets: '3', reps: '15', rest: '60s', instructions: "Don't lock knees at top" },
    { name: 'Leg Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Slow eccentric, 3s down' },
  ],
  Core: [
    { name: 'Plank', sets: '4', duration: '45s', rest: '30s', instructions: 'Squeeze everything, breathe steadily' },
    { name: 'Bicycle Crunches', sets: '4', reps: '20', rest: '30s', instructions: 'Elbow to opposite knee, controlled' },
    { name: 'Leg Raises', sets: '3', reps: '15', rest: '30s', instructions: "Lower legs slowly, don't touch floor" },
    { name: 'Dead Bug', sets: '3', reps: '10', rest: '30s', instructions: 'Each side, lower back on floor' },
    { name: 'Russian Twist', sets: '3', reps: '20', rest: '30s', instructions: 'Lift feet if possible, rotate fully' },
  ],
  Cardio: [
    { name: 'Jump Rope', sets: '5', duration: '60s', rest: '30s', instructions: 'Land on balls of feet' },
    { name: 'High Knees', sets: '5', duration: '40s', rest: '20s', instructions: 'Drive knees to waist, pump arms' },
    { name: 'Box Jumps', sets: '4', reps: '10', rest: '45s', instructions: 'Land softly, step down' },
    { name: 'Lateral Shuffles', sets: '4', duration: '40s', rest: '20s', instructions: 'Stay low, quick feet' },
  ],
  Arms: [
    { name: 'Dumbbell Bicep Curl', sets: '4', reps: '12', rest: '45s', instructions: 'Full extension at bottom' },
    { name: 'Hammer Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Neutral grip, no swinging' },
    { name: 'Tricep Overhead Extension', sets: '4', reps: '12', rest: '45s', instructions: 'Elbows close to head' },
    { name: 'Tricep Pushdowns', sets: '3', reps: '15', rest: '30s', instructions: 'Full extension, squeeze at bottom' },
  ],
  Back: [
    { name: 'Deadlift', sets: '4', reps: '8', rest: '120s', instructions: 'Chest up, push floor away' },
    { name: 'Pull-ups', sets: '4', reps: '8', rest: '90s', instructions: 'Initiate with lats, not arms' },
    { name: 'Dumbbell Row', sets: '4', reps: '12', rest: '60s', instructions: 'Each arm, row to hip' },
    { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '60s', instructions: 'Squeeze shoulder blades together' },
  ],
  Chest: [
    { name: 'Barbell / Dumbbell Bench Press', sets: '4', reps: '10', rest: '90s', instructions: 'Touch chest, lock out at top' },
    { name: 'Incline Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Target upper chest fibres' },
    { name: 'Dumbbell Flyes', sets: '3', reps: '12', rest: '60s', instructions: 'Wide arc, slight bend in elbow' },
    { name: 'Cable / Band Crossover', sets: '3', reps: '15', rest: '45s', instructions: 'Squeeze at the center' },
  ],
  Shoulders: [
    { name: 'Overhead Press', sets: '4', reps: '10', rest: '75s', instructions: 'Engage core, press through ceiling' },
    { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Lead with elbows, stop at shoulder height' },
    { name: 'Front Raises', sets: '3', reps: '12', rest: '45s', instructions: 'Alternate arms, controlled pace' },
    { name: 'Face Pulls', sets: '3', reps: '15', rest: '45s', instructions: 'External rotation at end range' },
  ],
  Glutes: [
    { name: 'Hip Thrust', sets: '4', reps: '15', rest: '60s', instructions: 'Drive through heels, full extension' },
    { name: 'Sumo Squat', sets: '4', reps: '12', rest: '60s', instructions: 'Wide stance, toes turned out 45°' },
    { name: 'Cable Kickback', sets: '3', reps: '15', rest: '45s', instructions: 'Each leg, squeeze at top' },
    { name: 'Bulgarian Split Squat', sets: '3', reps: '10', rest: '60s', instructions: 'Each leg, back foot elevated' },
  ],
  Rest: [],
};

const WARMUP = [
  { name: 'Jumping Jacks', sets: '1', duration: '90s', reps: null, rest: '15s', instructions: 'Steady pace, breathe rhythmically' },
  { name: 'Arm Circles', sets: '1', duration: '45s', reps: null, rest: '10s', instructions: 'Both directions, large circles' },
  { name: 'Leg Swings', sets: '1', duration: '45s', reps: null, rest: '10s', instructions: '10 each leg' },
];

const COOLDOWN = [
  { name: "Child's Pose", sets: '1', duration: '60s', reps: null, rest: '0s', instructions: 'Arms extended, deep breaths' },
  { name: 'Seated Hamstring Stretch', sets: '1', duration: '45s', reps: null, rest: '0s', instructions: 'Each leg, gentle hold' },
];

function buildWeeklyFallback(schedule: DayPlanConfig[], goal: string) {
  return {
    weekTitle: `${goal} Weekly Plan`,
    goal,
    days: schedule.map(d => ({
      day: d.day,
      focus: d.focus,
      isRest: d.isRest,
      workout: d.isRest ? null : {
        title: `${d.focus} Day`,
        totalTime: String(d.duration),
        sections: [
          { name: 'Warm-up', exercises: WARMUP },
          {
            name: 'Main Workout',
            exercises: (FOCUS_EXERCISES[d.focus] ?? FOCUS_EXERCISES['Full Body']).slice(
              0,
              Math.max(3, Math.floor(d.duration / 10))
            ),
          },
          { name: 'Cool-down', exercises: COOLDOWN },
        ],
      },
    })),
  };
}

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
    try {
      const body = await req.json();
      const data = WeeklyPlanRequestSchema.parse(body);
      const fallback = buildWeeklyFallback(data.schedule, data.goal);
      
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(fallback),
      });

      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
  }
  let validatedData;
  try {
    const body = await req.json();
    validatedData = WeeklyPlanRequestSchema.parse(body);

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey.includes('your_ai_api_key_here')) {
      console.warn('Gemini API key not found, using fallback.');
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

    const prompt = `You are a certified personal trainer. Generate a complete weekly workout plan.

User Details:
- Goal: ${validatedData.goal}
- Level: ${validatedData.level}
- Equipment: ${validatedData.equipment}
- Additional Notes: ${validatedData.notes || 'None'}

Weekly Schedule (each day has its own session duration):
${validatedData.schedule.map(d => `- ${d.day}: ${d.isRest ? 'REST DAY' : `${d.focus} — ${d.duration} minutes`}`).join('\n')}

For each active training day, generate a tailored workout matching the focus muscle group AND the specified duration for that day.
Rest days should have workout: null.

Return a JSON object exactly matching this schema:
{
  "weekTitle": "string (e.g. 'Power & Strength Week')",
  "goal": "string",
  "days": [
    {
      "day": "Monday",
      "focus": "Push",
      "isRest": false,
      "workout": {
        "title": "string",
        "totalTime": "string (number in minutes)",
        "sections": [
          {
            "name": "string (Warm-up | Main Workout | Cool-down)",
            "exercises": [
              {
                "name": "string",
                "sets": "string (number of sets, e.g. '3')",
                "duration": "string or null",
                "reps": "string or null",
                "rest": "string",
                "instructions": "string or null"
              }
            ]
          }
        ]
      }
    }
  ]
}

Ensure variety between workout days. Generate ALL ${validatedData.schedule.length} days listed in the schedule.`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();
    console.log(`Weekly plan generation took ${Date.now() - startTime}ms`);

    if (!content) throw new Error('Empty response from Gemini');

    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    try {
      const aiResponse = JSON.parse(content);
      const validatedPlan = WeeklyPlanSchema.parse(aiResponse);

      // Save to DB
      await db.insert(workouts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        content: JSON.stringify(validatedPlan),
      });

      return NextResponse.json(validatedPlan);
    } catch (parseError) {
      console.error('Validation/Parse Error:', parseError);
      console.log('Raw content:', content);
      throw parseError;
    }

  } catch (error) {
    console.error('Weekly Plan API Error:', error);
    if (validatedData) {
      const fallback = buildWeeklyFallback(validatedData.schedule, validatedData.goal);
      
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
