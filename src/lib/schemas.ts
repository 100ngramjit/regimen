import { z } from "zod";

export const WorkoutRequestSchema = z.object({
  goal: z.string().optional(),
  duration: z.number().min(5).max(120).optional(),
  equipment: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  notes: z.string().optional(),
});

export type WorkoutRequest = z.infer<typeof WorkoutRequestSchema>;

export const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.string().nullish(),
  duration: z.string().nullish(),
  reps: z.string().nullish(),
  rest: z.string(),
  instructions: z.string().nullish(),
});

export const WorkoutSectionSchema = z.object({
  name: z.string(),
  exercises: z.array(ExerciseSchema),
});

export const WorkoutSchema = z.object({
  title: z.string(),
  totalTime: z.string(),
  sections: z.array(WorkoutSectionSchema),
});

export type Workout = z.infer<typeof WorkoutSchema>;

// --- Weekly Plan Schemas ---

export const DAY_FOCUS_OPTIONS = [
  "Rest",
  "Pull",
  "Push",
  "Legs",
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Core",
  "Cardio",
  "Arms",
  "Back",
  "Chest",
  "Shoulders",
  "Glutes",
] as const;

export type DayFocus = (typeof DAY_FOCUS_OPTIONS)[number];

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DayPlanConfigSchema = z.object({
  day: z.enum(DAYS_OF_WEEK),
  focus: z.enum(DAY_FOCUS_OPTIONS),
  isRest: z.boolean().default(false),
  duration: z.number().min(15).max(180).default(60),
});

export const WeeklyPlanRequestSchema = z.object({
  daysPerWeek: z.number().min(1).max(7),
  goal: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  equipment: z.string(),
  sessionDuration: z.number().min(15).max(120),
  schedule: z.array(DayPlanConfigSchema),
  notes: z.string().optional(),
});

export type WeeklyPlanRequest = z.infer<typeof WeeklyPlanRequestSchema>;
export type DayPlanConfig = z.infer<typeof DayPlanConfigSchema>;
export type FitnessLevel = WeeklyPlanRequest["level"];

export const DayWorkoutSchema = z.object({
  day: z.string(),
  focus: z.string(),
  isRest: z.boolean(),
  workout: WorkoutSchema.nullable(),
});

export const WeeklyPlanSchema = z.object({
  weekTitle: z.string(),
  goal: z.string(),
  days: z.array(DayWorkoutSchema),
});

export type DayWorkout = z.infer<typeof DayWorkoutSchema>;
export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;
