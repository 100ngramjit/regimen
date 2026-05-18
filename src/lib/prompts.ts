import { WorkoutRequest, WeeklyPlanRequest } from './schemas';

/**
 * System prompt for single workout generation.
 */
export const DAILY_WORKOUT_SYSTEM_PROMPT = `You are a certified fitness coach.
Generate a professional workout plan based on the user input.

Constraints:
- Return ONLY valid JSON.
- No explanations or text outside the JSON.
- Keep total duration within the requested limit.
- Include Warm-up, Main Workout, and Cool-down sections.
- Ensure exercises are appropriate for the user's level and equipment.
- Each exercise must have detailed instructions following this format:
  "Setup: How to set up for the exercise. Execution: How to perform the movement. Breathing: When to inhale and exhale. Tip: One key coaching cue."

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
          "instructions": "Setup: ... Execution: ... Breathing: ... Tip: ..."
        }
      ]
    }
  ]
}`;

/**
 * Generates the user prompt for single workout generation.
 */
export function getDailyWorkoutUserPrompt(data: WorkoutRequest): string {
  const focusText = data.focus && data.focus.length > 0
    ? data.focus.join(', ')
    : 'Full Body';

  return `Generate a workout with these details:
         Goal: ${data.goal || 'General fitness'}
         Muscle Focus: ${focusText}
         Duration: ${data.duration || 30} mins
         Equipment: ${data.equipment || 'None'}
         Level: ${data.level || 'Beginner'}
         Additional Notes: ${data.notes || 'None'}

IMPORTANT: The workout MUST be centered around the ${focusText} muscle groups. Select exercises that primarily target these muscle groups.`;
}

/**
 * Generates the prompt for weekly workout plan generation.
 */
export function getWeeklyPlanPrompt(data: WeeklyPlanRequest): string {
  return `You are a certified personal trainer. Generate a complete weekly workout plan.

User Details:
- Goal: ${data.goal}
- Level: ${data.level}
- Equipment: ${data.equipment}
- Additional Notes: ${data.notes || 'None'}

Weekly Schedule (each day has its own session duration):
${data.schedule.map(d => `- ${d.day}: ${d.isRest ? 'REST DAY' : `${d.focus} — ${d.duration} minutes`}`).join('\n')}

For each active training day, generate a tailored workout matching the focus muscle group AND the specified duration for that day.
Rest days should have workout: null.
Each exercise must have detailed instructions following this format: "Setup: ... Execution: ... Breathing: ... Tip: ...".

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
                "instructions": "Setup: ... Execution: ... Breathing: ... Tip: ..."
              }
            ]
          }
        ]
      }
    }
  ]
}

Ensure variety between workout days. Generate ALL ${data.schedule.length} days listed in the schedule.`;
}
