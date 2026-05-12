import { Workout, WorkoutRequest } from './schemas';

type ExerciseTemplate = {
  name: string;
  sets: string;
  reps?: string;
  duration?: string;
  rest: string;
  instructions: string;
};

const WARMUP: ExerciseTemplate[] = [
  { name: 'Jumping Jacks', sets: '1', duration: '90s', rest: '15s', instructions: 'Steady pace, breathe rhythmically' },
  { name: 'Arm Circles', sets: '1', duration: '45s', rest: '10s', instructions: 'Large controlled circles each direction' },
  { name: 'Hip Circles', sets: '1', duration: '45s', rest: '10s', instructions: 'Hands on hips, full rotation' },
  { name: 'Leg Swings', sets: '1', duration: '45s', rest: '10s', instructions: '10 each leg, front-to-back' },
  { name: 'Inchworm', sets: '1', reps: '5', rest: '15s', instructions: 'Walk hands out to plank, walk back' },
];

const COOLDOWN: ExerciseTemplate[] = [
  { name: "Child's Pose", sets: '1', duration: '60s', rest: '0s', instructions: 'Arms extended, deep belly breaths' },
  { name: 'Seated Hamstring Stretch', sets: '1', duration: '45s', rest: '0s', instructions: 'Each leg, hold gently' },
  { name: 'Chest Opener Stretch', sets: '1', duration: '45s', rest: '0s', instructions: 'Clasp hands behind back, open chest' },
  { name: 'Standing Quad Stretch', sets: '1', duration: '30s', rest: '0s', instructions: 'Each leg, keep knees together' },
];

type FocusKey = 'fat loss' | 'muscle gain' | 'strength' | 'cardio' | 'flexibility' | 'general';
type LevelKey = 'beginner' | 'intermediate' | 'advanced';

const EXERCISE_BANK: Record<FocusKey, Record<LevelKey, ExerciseTemplate[]>> = {
  'fat loss': {
    beginner: [
      { name: 'Bodyweight Squats', sets: '3', reps: '15', rest: '30s', instructions: 'Weight in heels, chest up' },
      { name: 'Push-ups (Knee)', sets: '3', reps: '12', rest: '30s', instructions: 'Keep core engaged throughout' },
      { name: 'Mountain Climbers', sets: '3', duration: '30s', rest: '30s', instructions: 'Drive knees to chest quickly' },
      { name: 'Glute Bridges', sets: '3', reps: '15', rest: '30s', instructions: 'Squeeze at the top for 1s' },
      { name: 'Standing March', sets: '3', duration: '45s', rest: '20s', instructions: 'Drive knees high alternately' },
    ],
    intermediate: [
      { name: 'Jump Squats', sets: '4', reps: '12', rest: '45s', instructions: 'Land softly, go straight back down' },
      { name: 'Push-ups', sets: '4', reps: '15', rest: '30s', instructions: 'Full range, chest to floor' },
      { name: 'Burpees', sets: '4', reps: '10', rest: '45s', instructions: 'Explosive jump, controlled descent' },
      { name: 'Lateral Lunges', sets: '3', reps: '12', rest: '30s', instructions: 'Each side, keep chest up' },
      { name: 'High Knees', sets: '4', duration: '40s', rest: '20s', instructions: 'Pump arms, drive knees to waist' },
    ],
    advanced: [
      { name: 'Tuck Jumps', sets: '4', reps: '12', rest: '30s', instructions: 'Pull knees to chest at peak' },
      { name: 'Plyometric Push-ups', sets: '4', reps: '10', rest: '30s', instructions: 'Explosive push, clap if possible' },
      { name: 'Burpee Broad Jumps', sets: '4', reps: '8', rest: '45s', instructions: 'Jump forward after each burpee' },
      { name: 'Sprint Intervals', sets: '6', duration: '20s', rest: '10s', instructions: 'Max effort sprints in place' },
      { name: 'Devil Press', sets: '4', reps: '8', rest: '60s', instructions: 'Dumbbell burpee into alternating press' },
    ],
  },
  'muscle gain': {
    beginner: [
      { name: 'Bodyweight Squats', sets: '3', reps: '12', rest: '60s', instructions: 'Controlled descent, 2s hold at bottom' },
      { name: 'Push-ups', sets: '3', reps: '10', rest: '60s', instructions: 'Slow descent (3s), explosive up' },
      { name: 'Dumbbell Rows', sets: '3', reps: '10', rest: '60s', instructions: 'Each arm, elbow to ceiling' },
      { name: 'Glute Bridge', sets: '3', reps: '15', rest: '45s', instructions: 'Pause 2s at top, squeeze glutes' },
      { name: 'Plank Hold', sets: '3', duration: '30s', rest: '45s', instructions: 'Neutral spine, squeeze everything' },
    ],
    intermediate: [
      { name: 'Dumbbell Goblet Squats', sets: '4', reps: '10', rest: '75s', instructions: 'Elbows inside knees at bottom' },
      { name: 'Dumbbell Bench Press', sets: '4', reps: '10', rest: '75s', instructions: 'Full stretch at bottom, press explosively' },
      { name: 'Bent-over Dumbbell Rows', sets: '4', reps: '10', rest: '75s', instructions: 'Hinge 45°, row to hip' },
      { name: 'Romanian Deadlift', sets: '4', reps: '10', rest: '75s', instructions: 'Hinge at hips, slight knee bend' },
      { name: 'Overhead Press', sets: '3', reps: '10', rest: '75s', instructions: 'Press straight up, lock out at top' },
    ],
    advanced: [
      { name: 'Barbell Back Squat', sets: '5', reps: '5', rest: '120s', instructions: 'Below parallel, brace hard' },
      { name: 'Weighted Pull-ups', sets: '4', reps: '6', rest: '120s', instructions: 'Full dead hang, chin over bar' },
      { name: 'Barbell Bench Press', sets: '5', reps: '5', rest: '120s', instructions: 'Touch chest, full lock out' },
      { name: 'Barbell Deadlift', sets: '4', reps: '5', rest: '180s', instructions: 'Chest up, drive floor away' },
      { name: 'Dips (Weighted)', sets: '4', reps: '8', rest: '90s', instructions: 'Full dip, lean forward for chest' },
    ],
  },
  strength: {
    beginner: [
      { name: 'Goblet Squat', sets: '3', reps: '8', rest: '90s', instructions: 'Heavy-ish weight, slow and controlled' },
      { name: 'Push-ups (Slow)', sets: '3', reps: '8', rest: '90s', instructions: '4s down, 1s up' },
      { name: 'Dumbbell Romanian Deadlift', sets: '3', reps: '8', rest: '90s', instructions: 'Feel hamstring stretch' },
      { name: 'Plank', sets: '3', duration: '45s', rest: '60s', instructions: 'Rigid body, brace like a punch is coming' },
    ],
    intermediate: [
      { name: 'Barbell Back Squat', sets: '4', reps: '6', rest: '120s', instructions: 'Hit depth, drive elbows forward' },
      { name: 'Barbell Bench Press', sets: '4', reps: '6', rest: '120s', instructions: 'Arch, retract scapula, leg drive' },
      { name: 'Barbell Deadlift', sets: '3', reps: '5', rest: '150s', instructions: 'Hook grip, push the floor, not pull bar' },
      { name: 'Barbell Row', sets: '4', reps: '6', rest: '120s', instructions: 'Bar to belly button, control descent' },
    ],
    advanced: [
      { name: 'Barbell Back Squat (Heavy)', sets: '5', reps: '3', rest: '180s', instructions: 'Work to 85–90% max, brace hard' },
      { name: 'Barbell Bench Press (Heavy)', sets: '5', reps: '3', rest: '180s', instructions: 'Max tension setup, explosive press' },
      { name: 'Barbell Deadlift (Heavy)', sets: '4', reps: '3', rest: '210s', instructions: 'Near maximal load, reset each rep' },
      { name: 'Overhead Press (Heavy)', sets: '4', reps: '4', rest: '150s', instructions: 'Squeeze glutes, press through ceiling' },
      { name: 'Weighted Chin-ups', sets: '4', reps: '4', rest: '150s', instructions: 'Control descent 3s, explosive up' },
    ],
  },
  cardio: {
    beginner: [
      { name: 'Brisk Walk Intervals', sets: '4', duration: '3 min', rest: '1 min', instructions: 'Fast walk, breathe through nose' },
      { name: 'Step-Touches', sets: '3', duration: '90s', rest: '30s', instructions: 'Side to side, stay light on feet' },
      { name: 'March in Place', sets: '3', duration: '60s', rest: '30s', instructions: 'High knees, pump your arms' },
    ],
    intermediate: [
      { name: 'Jump Rope (or imaginary)', sets: '5', duration: '60s', rest: '30s', instructions: 'Land on balls of feet, elbows in' },
      { name: 'High Knees', sets: '4', duration: '45s', rest: '20s', instructions: 'Sprint effort, max knee height' },
      { name: 'Box Step-ups', sets: '4', reps: '15', rest: '30s', instructions: 'Each leg, drive through heel' },
      { name: 'Lateral Shuffles', sets: '4', duration: '40s', rest: '20s', instructions: 'Stay low, quick feet' },
    ],
    advanced: [
      { name: 'Sprint Intervals (Treadmill / Outdoor)', sets: '8', duration: '30s', rest: '30s', instructions: '90% effort per sprint' },
      { name: 'Jump Rope Double-unders', sets: '5', reps: '20', rest: '30s', instructions: 'Tight core, wrist-driven rotation' },
      { name: 'Assault Bike', sets: '6', duration: '30s', rest: '30s', instructions: 'Max push-pull intensity' },
      { name: 'Burpees', sets: '5', reps: '15', rest: '45s', instructions: 'Constant pace, no pausing' },
    ],
  },
  flexibility: {
    beginner: [
      { name: 'Standing Forward Fold', sets: '3', duration: '60s', rest: '15s', instructions: 'Soft knees, release neck' },
      { name: 'Cat-Cow', sets: '3', reps: '10', rest: '15s', instructions: 'Inhale arch, exhale round' },
      { name: 'Seated Butterfly', sets: '3', duration: '60s', rest: '15s', instructions: 'Gentle pressure on inner thighs' },
      { name: 'Hip Flexor Stretch', sets: '3', duration: '45s', rest: '15s', instructions: 'Each side, squeeze glute of back leg' },
    ],
    intermediate: [
      { name: 'Pigeon Pose', sets: '3', duration: '90s', rest: '15s', instructions: 'Each side, square hips forward' },
      { name: 'Downward Dog', sets: '3', duration: '60s', rest: '15s', instructions: 'Pedal feet, press heels down' },
      { name: 'Lizard Pose', sets: '3', duration: '60s', rest: '15s', instructions: 'Each side, deep groin opener' },
      { name: 'Thoracic Rotation', sets: '3', reps: '8', rest: '15s', instructions: 'Each side, follow hand with eyes' },
    ],
    advanced: [
      { name: 'Full Split (or progression)', sets: '3', duration: '90s', rest: '20s', instructions: 'Each side, use blocks if needed' },
      { name: 'Wheel Pose', sets: '3', duration: '30s', rest: '30s', instructions: 'Press through hands and feet' },
      { name: 'Standing Splits', sets: '3', duration: '45s', rest: '20s', instructions: 'Each leg, fingertips to floor' },
      { name: 'Shoulder Dislocates', sets: '3', reps: '10', rest: '15s', instructions: 'Use a band or PVC pipe, slow and wide' },
    ],
  },
  general: {
    beginner: [
      { name: 'Bodyweight Squats', sets: '3', reps: '12', rest: '45s', instructions: 'Weight in heels, chest up' },
      { name: 'Push-ups', sets: '3', reps: '10', rest: '45s', instructions: 'Keep core tight' },
      { name: 'Glute Bridge', sets: '3', reps: '15', rest: '30s', instructions: 'Squeeze at the top' },
      { name: 'Plank Hold', sets: '3', duration: '30s', rest: '30s', instructions: 'Flat back, breathe steadily' },
    ],
    intermediate: [
      { name: 'Dumbbell Squats', sets: '4', reps: '12', rest: '60s', instructions: 'Dumbbells at shoulders' },
      { name: 'Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Chest to floor, explosive up' },
      { name: 'Dumbbell Rows', sets: '4', reps: '12', rest: '60s', instructions: 'Each arm, elbow to ceiling' },
      { name: 'Romanian Deadlift', sets: '3', reps: '12', rest: '60s', instructions: 'Hinge at hips, feel hamstrings' },
      { name: 'Plank', sets: '3', duration: '45s', rest: '30s', instructions: 'Squeeze glutes and abs' },
    ],
    advanced: [
      { name: 'Barbell Squat', sets: '4', reps: '8', rest: '90s', instructions: 'Hit depth, drive out of hole' },
      { name: 'Pull-ups', sets: '4', reps: '8', rest: '90s', instructions: 'Full dead hang, chin over bar' },
      { name: 'Dips', sets: '4', reps: '10', rest: '75s', instructions: 'Lean forward, full range' },
      { name: 'Barbell Deadlift', sets: '3', reps: '6', rest: '120s', instructions: 'Chest up, push floor away' },
      { name: 'Ab Wheel Rollout', sets: '3', reps: '10', rest: '60s', instructions: 'Slow extension, pull back with lats' },
    ],
  },
};

export const generateFallbackWorkout = (request: WorkoutRequest): Workout => {
  const level = (request.level ?? 'beginner') as LevelKey;
  const duration = request.duration ?? 30;

  // Normalise goal to a key
  const rawGoal = (request.goal ?? 'general').toLowerCase();
  const goalKey: FocusKey =
    rawGoal.includes('fat') || rawGoal.includes('weight') || rawGoal.includes('cut')
      ? 'fat loss'
      : rawGoal.includes('muscle') || rawGoal.includes('hypertrophy') || rawGoal.includes('mass')
      ? 'muscle gain'
      : rawGoal.includes('strength') || rawGoal.includes('power')
      ? 'strength'
      : rawGoal.includes('cardio') || rawGoal.includes('endurance') || rawGoal.includes('conditioning')
      ? 'cardio'
      : rawGoal.includes('flex') || rawGoal.includes('mobility') || rawGoal.includes('yoga')
      ? 'flexibility'
      : 'general';

  const mainExercises = EXERCISE_BANK[goalKey][level];

  // Scale number of exercises to duration (roughly 4–5 min per exercise)
  const exerciseCount = Math.min(mainExercises.length, Math.max(3, Math.floor(duration / 5)));

  const title = `${level.charAt(0).toUpperCase() + level.slice(1)} ${request.goal ?? 'General'} Workout`;

  return {
    title,
    totalTime: duration.toString(),
    sections: [
      {
        name: 'Warm-up',
        exercises: WARMUP.slice(0, 3),
      },
      {
        name: 'Main Workout',
        exercises: mainExercises.slice(0, exerciseCount),
      },
      {
        name: 'Cool-down',
        exercises: COOLDOWN.slice(0, 3),
      },
    ],
  };
};
