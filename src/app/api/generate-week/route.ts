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
    { name: 'Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Place your hands flat on the floor, slightly wider than shoulder-width apart, with your feet together and body in a straight line from head to heels. Execution: Bend your elbows at a 45-degree angle to lower your chest until it is just above the floor. Push through your palms to return to the starting position. Breathing: Inhale as you lower, exhale as you push up. Tip: Brace your abs and glutes to keep your lower back from sagging.' },
    { name: 'Dumbbell Overhead Press', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Sit or stand holding dumbbells at shoulder height, palms facing forward. Keep your core tight. Execution: Press the dumbbells straight up over your head until your arms are fully extended. Lower the weights slowly and under control back to your shoulders. Breathing: Exhale as you press up, inhale as you lower. Tip: Avoid arching your lower back as you press the weights overhead.' },
    { name: 'Tricep Dips', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Mount a dip station and support your body weight with arms fully extended. Execution: Lean your torso forward slightly, bend your elbows, and lower your body until your shoulders are slightly below your elbows. Press back up to full lockout. Breathing: Inhale as you lower, exhale as you press back up. Tip: Keep your elbows tucked close to your body and avoid flaring them outwards.' },
    { name: 'Incline Push-ups', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Place your hands on an elevated, stable surface (like a bench, step, or sturdy table) slightly wider than shoulders. Stand back so your body is in a straight line. Execution: Keep your body rigid as you bend your elbows and lower your chest to the edge of the surface. Press back up to the start. Breathing: Inhale as you lower, exhale as you push away. Tip: The higher the surface, the easier the exercise; choose a height that challenges you.' },
  ],
  Pull: [
    { name: 'Pull-ups / Band-assisted Pull-ups', sets: '4', reps: '8', rest: '75s', instructions: 'Setup: Grasp the pull-up bar with an overhand grip (palms facing away), hands slightly wider than shoulder-width. Let your body hang. Execution: Pull your chest up toward the bar by driving your elbows down and back. Continue until your chin clears the bar, then slowly lower yourself to a full dead hang. Breathing: Exhale as you pull up, inhale as you lower down. Tip: Avoid swinging or using momentum; keep your core braced.' },
    { name: 'Dumbbell Bent-over Row', sets: '4', reps: '12', rest: '60s', instructions: 'Setup: Stand with feet hip-width apart holding dumbbells. Hinge forward at your hips, keeping your back flat and knees slightly bent, until your torso is at a 45-degree angle. Execution: Row the dumbbells up towards your lower chest by driving your elbows high and back. Squeeze your upper back, then lower slowly. Breathing: Exhale as you row, inhale as you lower. Tip: Do not let your lower back round; keep your core braced throughout.' },
    { name: 'Face Pulls', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Attach a rope to a cable machine set at eye height. Grab the ends with an overhand grip, step back to lift the weight, and stand with a solid stance. Execution: Pull the center of the rope towards your nose, flaring your elbows high and out, while pulling the ends apart near your ears. Hold for 1 second. Breathing: Exhale as you pull, inhale as you return. Tip: Focus on squeezing your rear delts and upper back at the end range.' },
    { name: 'Dumbbell Bicep Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand tall with feet hip-width apart holding dumbbells at your sides, palms facing forward. Execution: Keep your elbows pinned to your ribs, curl the dumbbells up to shoulder height, and squeeze your biceps hard. Lower the weights slowly to full extension. Breathing: Exhale as you curl up, inhale as you lower. Tip: Do not swing your hips or elbows forward to help lift the weights.' },
  ],
  Legs: [
    { name: 'Barbell / Goblet Squat', sets: '4', reps: '10', rest: '90s', instructions: 'Setup: Rest a barbell on your upper back or hold a dumbbell vertically at your chest. Place feet shoulder-width apart, toes pointed slightly out. Execution: Push your hips back and bend your knees to lower your hips until thighs are parallel to the floor or lower, then drive through your heels to stand up. Breathing: Inhale as you lower down, exhale as you stand up. Tip: Keep your knees aligned with your toes and do not let them collapse inward.' },
    { name: 'Romanian Deadlift', sets: '4', reps: '10', rest: '75s', instructions: 'Setup: Stand holding dumbbells or a bar. Hinge forward at your hips, keeping your back flat and knees slightly bent, lowering the weights along your thighs. Squeeze glutes to stand. Execution: Slowly lower the weights along your shins until you feel a deep stretch in your hamstrings, keeping your back perfectly straight. Squeeze your glutes and hamstrings to return to standing. Breathing: Inhale as you lower, exhale as you stand up. Tip: Keep the weights close to your legs throughout the movement to protect your lower back.' },
    { name: 'Walking Lunges', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Stand tall with your feet hip-width apart and hands on your hips. Execution: Step forward with one leg, bending both knees to 90 degrees to lower your hips. Press off your front foot and step your back foot forward to meet the front, or step directly into the next lunge. Breathing: Inhale as you lower into the lunge, exhale as you push up and step forward. Tip: Keep your front knee stacked over your ankle and your chest upright.' },
    { name: 'Calf Raises', sets: '4', reps: '20', rest: '30s', instructions: 'Setup: Stand on a flat surface or the edge of a step, holding onto a wall for balance if needed. Execution: Press down through the balls of your feet and raise your heels as high as possible, squeezing your calves. Lower slowly. Breathing: Exhale as you lift, inhale as you lower. Tip: Pause at the top of each rep to maximize calf muscle contraction.' },
  ],
  'Full Body': [
    { name: 'Burpees', sets: '4', reps: '10', rest: '45s', instructions: 'Setup: Stand tall with your feet shoulder-width apart and arms at your sides. Execution: Drop into a deep squat, place your hands flat on the floor, and jump your feet back into a full plank. Perform a push-up, jump your feet back to your hands, and leap explosively into the air with arms overhead. Breathing: Breathe continuously; exhale as you jump back and up, inhale as you drop down. Tip: Keep your core braced throughout the plank and push-up phases to protect your spine.' },
    { name: 'Dumbbell Thruster', sets: '4', reps: '10', rest: '60s', instructions: 'Setup: Stand tall with feet shoulder-width apart, holding dumbbells at shoulder height with palms facing each other. Execution: Perform a full squat by bending your knees and pushing your hips back. As you stand up, explode upward and use your leg drive to press the dumbbells straight overhead to full extension. Breathing: Inhale as you squat down, exhale explosively as you press overhead. Tip: Keep your torso upright and do not let the dumbbells pull you forward in the squat.' },
    { name: 'Renegade Rows', sets: '3', reps: '8', rest: '60s', instructions: 'Setup: Assume a full push-up position, holding dumbbells in each hand with your feet spaced wide for stability. Execution: Perform a complete push-up. At the top, row one dumbbell up to your ribcage while keeping your hips completely square to the floor. Lower the weight and repeat the row on the opposite side. Breathing: Inhale as you lower, exhale as you row. Tip: Squeeze your core and glutes hard to prevent your hips from rotating during the row.' },
    { name: 'Jump Squats', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand with feet shoulder-width apart, toes pointing slightly outward. Execution: Lower into a half-squat by pushing your hips back, then explode upward into a jump as high as possible, reaching your arms high. Land softly on the balls of your feet and immediately absorb the impact by sinking back into the next squat. Breathing: Inhale as you squat down, exhale explosively as you jump up. Tip: Focus on a soft, controlled landing to protect your knees and ankles.' },
  ],
  'Upper Body': [
    { name: 'Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Place your hands flat on the floor, slightly wider than shoulder-width apart, with your feet together and body in a straight line from head to heels. Execution: Bend your elbows at a 45-degree angle to lower your chest until it is just above the floor. Push through your palms to return to the starting position. Breathing: Inhale as you lower, exhale as you push up. Tip: Brace your abs and glutes to keep your lower back from sagging.' },
    { name: 'Dumbbell Row', sets: '4', reps: '12', rest: '60s', instructions: 'Setup: Place one knee and your same-side hand flat on a bench for support, keeping your back flat and parallel to the floor. Hold a dumbbell in your other hand, arm hanging straight down. Execution: Pull your elbow up and back towards your hip, squeezing your shoulder blade at the top of the movement. Lower the dumbbell slowly to the starting position. Breathing: Exhale as you pull the weight up, inhale as you lower it. Tip: Pull with your back muscles rather than your biceps, keeping your elbow tucked close.' },
    { name: 'Overhead Press', sets: '3', reps: '10', rest: '75s', instructions: 'Setup: Stand with feet shoulder-width apart, holding a barbell at collarbone height. Press the bar straight up over your head, pushing your head slightly forward at the top for full lockout. Lower the bar slowly to your chest. Breathing: Exhale as you press, inhale as you lower. Tip: Keep your path straight by pulling your chin back slightly as the bar passes.' },
    { name: 'Bicep Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand tall with feet hip-width apart holding dumbbells at your sides, palms facing forward. Execution: Keep your elbows pinned to your ribs, curl the dumbbells up to shoulder height, and squeeze your biceps hard. Lower the weights slowly to full extension. Breathing: Exhale as you curl up, inhale as you lower. Tip: Do not swing your hips or elbows forward to help lift the weights.' },
  ],
  'Lower Body': [
    { name: 'Squat', sets: '4', reps: '12', rest: '75s', instructions: 'Setup: Stand with your feet shoulder-width apart, toes pointed slightly outward, and arms relaxed at your sides. Execution: Push your hips back and bend your knees to lower your body as if sitting back into a deep chair, keeping your chest tall. Drive through your heels to return to a standing position. Breathing: Inhale as you lower down, exhale as you stand up. Tip: Keep your knees aligned with your toes and do not let them collapse inward.' },
    { name: 'Hip Thrust', sets: '4', reps: '15', rest: '60s', instructions: 'Setup: Sit on the floor with your upper back against a bench. Place a barbell or weight across your hips, holding it in place. Execution: Drive through your heels to lift your hips parallel to the floor, forming a straight line from shoulders to knees. Squeeze your glutes hard at the top, then lower slowly. Breathing: Exhale as you thrust, inhale as you lower. Tip: Keep your chin tucked and look forward, not up at the ceiling, to avoid hyperextending your lower back.' },
    { name: 'Leg Press', sets: '3', reps: '15', rest: '60s', instructions: 'Setup: Sit in the leg press machine and place your feet shoulder-width apart on the sled. Execution: Release the safety locks and slowly lower the platform towards your chest by bending your knees to 90 degrees. Press the platform away by extending your legs, without locking your knees. Breathing: Inhale as you lower, exhale as you press. Tip: Keep your lower back pressed firmly against the seat pad at all times.' },
    { name: 'Leg Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Lie face down or sit in the leg curl machine, adjusting the roller pad to rest just below your calves/ankles. Execution: Keep your hips flat against the bench and curl your heels up toward your glutes by contracting your hamstrings. Lower slowly to the starting position. Breathing: Exhale as you curl, inhale as you release. Tip: Squeeze your hamstrings at the top of the movement for 1 second.' },
  ],
  Core: [
    { name: 'Plank', sets: '4', duration: '45s', rest: '30s', instructions: 'Setup: Rest your weight on your forearms and toes. Execution: Keep your body in a perfectly straight line from head to heels, engage your abs, glutes, and thighs, and hold while breathing. Breathing: Breathe deeply and continuously. Tip: Do not let your hips sag or raise your glutes high.' },
    { name: 'Bicycle Crunches', sets: '4', reps: '20', rest: '30s', instructions: 'Setup: Lie flat on your back, place your hands gently behind your head, and lift your shoulder blades slightly off the floor. Execution: Lift both legs and bend your knees. Alternating sides, bring one elbow towards the opposite knee while extending the other leg straight, moving in a smooth pedaling motion. Breathing: Exhale as you twist, inhale as you return to center. Tip: Do not pull on your neck; focus on twisting from your core and shoulders.' },
    { name: 'Leg Raises', sets: '3', reps: '15', rest: '30s', instructions: 'Setup: Lie flat on your back, placing your hands under your glutes for lower back support. Keep legs straight. Execution: Keeping your legs straight and together, slowly raise them up to a 90-degree angle. Lower them back down under strict control without touching the floor. Breathing: Exhale as you raise your legs, inhale as you lower them. Tip: Press your lower back flat into the floor throughout the entire movement.' },
    { name: 'Dead Bug', sets: '3', reps: '10', rest: '30s', instructions: 'Setup: Lie flat on your back, extending your arms straight up toward the ceiling and bending your knees and hips to 90 degrees. Execution: Keep your core tight and slowly lower one arm overhead while extending the opposite leg straight forward until both are just above the floor. Return to the start and repeat on the other side. Breathing: Inhale as you extend, exhale as you pull back to center. Tip: Keep your lower back pressed flat into the floor; do not let it arch.' },
    { name: 'Russian Twist', sets: '3', reps: '20', rest: '30s', instructions: 'Setup: Sit with knees bent, feet flat on the floor, and lean back slightly to engage your abs. Lift your feet off the floor for an extra challenge. Execution: Hold your hands together at your chest and twist your torso from side to side, touching the floor next to your hips on each twist. Breathing: Breathe rhythmically, flexing your obliques on each side. Tip: Focus on rotating from your torso, not just moving your arms.' },
  ],
  Cardio: [
    { name: 'Jump Rope', sets: '5', duration: '60s', rest: '30s', instructions: 'Setup: Stand tall holding jump rope handles, rope behind your heels. Execution: Jump just high enough to clear the rope, landing softly on the balls of your feet, keeping your elbows tucked and wrists turning the rope. Breathing: Breathe rhythmically and quickly to maintain endurance. Tip: Keep your hands close to your hips and rotate from your wrists, not your elbows.' },
    { name: 'High Knees', sets: '5', duration: '40s', rest: '20s', instructions: 'Setup: Stand tall with your feet hip-width apart and arms bent at a 90-degree angle. Execution: Run in place rapidly, driving your knees up to waist height with each stride while pumping your arms aggressively to keep your heart rate up. Breathing: Breathe deeply and rhythmically to support the high-intensity movement. Tip: Stay on the balls of your feet and maintain a high, fast turnover rate.' },
    { name: 'Box Jumps', sets: '4', reps: '10', rest: '45s', instructions: 'Setup: Stand in front of a sturdy box or bench, feet hip-width apart. Execution: Swing your arms and bend your knees, then explode upward to jump onto the box, landing softly in a squat position. Step down carefully. Breathing: Exhale explosively as you jump, inhale as you step down. Tip: Stand up tall at the top of the box to complete the rep before stepping down.' },
    { name: 'Lateral Shuffles', sets: '4', duration: '40s', rest: '20s', instructions: 'Setup: Assume a low athletic stance. Execution: Step rapidly to the side with one foot and follow with the other, staying low and keeping your chest up without crossing your feet. Breathing: Breathe in short, sharp exhales as you shuffle, keeping your airway clear. Tip: Focus on staying low to keep constant tension on your quads and glutes.' },
  ],
  Arms: [
    { name: 'Dumbbell Bicep Curl', sets: '4', reps: '12', rest: '45s', instructions: 'Setup: Stand tall with feet hip-width apart holding dumbbells at your sides, palms facing forward. Execution: Keep your elbows pinned to your ribs, curl the dumbbells up to shoulder height, and squeeze your biceps hard. Lower the weights slowly to full extension. Breathing: Exhale as you curl up, inhale as you lower. Tip: Do not swing your hips or elbows forward to help lift the weights.' },
    { name: 'Hammer Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand holding dumbbells at your sides with your palms facing each other (neutral grip). Keep your chest tall. Execution: Keeping your elbows fixed at your sides, curl the dumbbells up to shoulder height while maintaining the neutral grip. Lower slowly. Breathing: Exhale as you curl, inhale as you lower. Tip: This targets the brachialis and forearms; keep your wrists completely straight.' },
    { name: 'Tricep Overhead Extension', sets: '4', reps: '12', rest: '45s', instructions: 'Setup: Sit or stand tall, holding a dumbbell overhead with both hands, arms extended straight up. Execution: Keep your upper arms locked still near your ears and slowly lower the dumbbell behind your head by bending your elbows. Press the weight back up to full extension. Breathing: Inhale as you lower, exhale as you press up. Tip: Keep your elbows tucked in; do not let them flare out wide.' },
    { name: 'Tricep Pushdowns', sets: '3', reps: '15', rest: '30s', instructions: 'Setup: Stand facing a high cable pulley with a rope or bar. Keep your elbows pinned to your sides and push the attachment down until arms are fully extended, squeezing the triceps. Execution: Press the bar/rope down until your arms are fully locked out at your sides. Slowly return to the starting position under control. Breathing: Exhale as you push down, inhale as you return. Tip: Do not lean your body weight on the attachment; let your triceps do all the work.' },
  ],
  Back: [
    { name: 'Deadlift', sets: '4', reps: '8', rest: '120s', instructions: 'Setup: Stand with feet hip-width apart under the barbell, shin 1 inch from the bar. Hinge down, grip the bar at shoulder-width, flatten your back, and drop your hips slightly. Execution: Push the floor away with your legs, standing up tall. Pull the bar in a straight line close to your body, squeezing your glutes at the top. Lower under control. Breathing: Inhale and brace at the bottom, hold your breath during the lift, exhale at the top. Tip: Keep your spine perfectly neutral; do not round your back.' },
    { name: 'Pull-ups', sets: '4', reps: '8', rest: '90s', instructions: 'Setup: Grasp the pull-up bar with an overhand grip (palms facing away), hands slightly wider than shoulder-width. Let your body hang. Execution: Pull your chest up toward the bar by driving your elbows down and back. Continue until your chin clears the bar, then slowly lower yourself to a full dead hang. Breathing: Exhale as you pull up, inhale as you lower down. Tip: Avoid swinging or using momentum; keep your core braced.' },
    { name: 'Dumbbell Row', sets: '4', reps: '12', rest: '60s', instructions: 'Setup: Place one knee and your same-side hand flat on a bench for support, keeping your back flat and parallel to the floor. Hold a dumbbell in your other hand, arm hanging straight down. Execution: Pull your elbow up and back towards your hip, squeezing your shoulder blade at the top of the movement. Lower the dumbbell slowly to the starting position. Breathing: Exhale as you pull the weight up, inhale as you lower it. Tip: Pull with your back muscles rather than your biceps, keeping your elbow tucked close.' },
    { name: 'Seated Cable Row', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Sit facing a low cable pulley machine, place feet flat on the footrests, and hold the attachment with an overhand or neutral grip. Keep your knees slightly bent. Execution: Pull the handle towards your abdomen by driving your elbows backward, keeping your back straight and squeezing your shoulder blades. Slowly release to the starting position. Breathing: Exhale as you pull, inhale as you release. Tip: Do not swing your torso forward and back to gain momentum.' },
  ],
  Chest: [
    { name: 'Barbell / Dumbbell Bench Press', sets: '4', reps: '10', rest: '90s', instructions: 'Setup: Lie flat on a bench with your feet flat on the floor. Grip the barbell/dumbbell slightly wider than shoulder-width at chest level. Execution: Press the weights straight up over your chest until your arms are fully extended. Lower slowly under control back to your mid-chest. Breathing: Exhale as you press up, inhale as you lower. Tip: Keep your shoulder blades squeezed together against the bench for maximum chest recruitment.' },
    { name: 'Incline Push-ups', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Place your hands on an elevated, stable surface (like a bench, step, or sturdy table) slightly wider than shoulders. Stand back so your body is in a straight line. Execution: Keep your body rigid as you bend your elbows and lower your chest to the edge of the surface. Press back up to the start. Breathing: Inhale as you lower, exhale as you push away. Tip: The higher the surface, the easier the exercise; choose a height that challenges you.' },
    { name: 'Dumbbell Flyes', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Lie flat on a bench holding dumbbells above your chest, palms facing each other. Keep a very slight bend in your elbows. Execution: Slowly lower the weights out to the sides in a wide arc until you feel a comfortable stretch in your chest. Reverse the arc to bring the dumbbells back to the starting position. Breathing: Inhale as you lower out, exhale as you bring the weights together. Tip: Do not bend your elbows further as you lower; keep the arm angle fixed.' },
    { name: 'Cable / Band Crossover', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Stand in the center of a dual cable machine with pulleys positioned high, holding the D-handles. Step forward slightly and lean forward. Execution: Keep a slight bend in your elbows and bring your hands down and together in a wide arc in front of your lower chest, squeezing your chest muscles. Slowly return. Breathing: Exhale as you cross your hands, inhale as you return. Tip: Focus on pushing your biceps against your outer chest at the end range.' },
  ],
  Shoulders: [
    { name: 'Overhead Press', sets: '4', reps: '10', rest: '75s', instructions: 'Setup: Stand with feet shoulder-width apart, holding a barbell at collarbone height. Press the bar straight up over your head, pushing your head slightly forward at the top for full lockout. Lower the bar slowly to your chest. Breathing: Exhale as you press, inhale as you lower. Tip: Keep your path straight by pulling your chin back slightly as the bar passes.' },
    { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Stand tall holding dumbbells at your sides. Keep your chest up and shoulders down. Execution: Keeping a very slight bend in your elbows, raise your arms out to the sides until they are parallel to the floor, leading with your elbows. Lower slowly. Breathing: Exhale as you lift, inhale as you lower. Tip: Do not swing your body; keep the movement slow and controlled.' },
    { name: 'Front Raises', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand tall holding dumbbells in front of your thighs. Execution: Raise one dumbbell straight forward in front of you to shoulder level, keeping your arm straight. Lower slowly, then repeat with the other arm. Breathing: Exhale as you raise the weight, inhale as you lower it. Tip: Focus on lifting with your front delts, not by rocking your body.' },
    { name: 'Face Pulls', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Attach a rope to a cable machine set at eye height. Grab the ends with an overhand grip, step back to lift the weight, and stand with a solid stance. Execution: Pull the center of the rope towards your nose, flaring your elbows high and out, while pulling the ends apart near your ears. Hold for 1 second. Breathing: Exhale as you pull, inhale as you return. Tip: Focus on squeezing your rear delts and upper back at the end range.' },
  ],
  Glutes: [
    { name: 'Hip Thrust', sets: '4', reps: '15', rest: '60s', instructions: 'Setup: Sit on the floor with your upper back against a bench. Place a barbell or weight across your hips, holding it in place. Execution: Drive through your heels to lift your hips parallel to the floor, forming a straight line from shoulders to knees. Squeeze your glutes hard at the top, then lower slowly. Breathing: Exhale as you thrust, inhale as you lower. Tip: Keep your chin tucked and look forward, not up at the ceiling, to avoid hyperextending your lower back.' },
    { name: 'Sumo Squat', sets: '4', reps: '12', rest: '60s', instructions: 'Setup: Stand with feet wider than shoulder-width, toes pointed out at 45 degrees. Hold a dumbbell/kettlebell at your chest and lower your hips tall, keeping knees out. Execution: Lower your hips under strict control, keeping your knees pushed out and chest high, then push back up. Breathing: Inhale as you lower down, exhale as you stand up. Tip: Keep your chest up and knees aligned with your toes.' },
    { name: 'Cable Kickback', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Attach an ankle strap to a low pulley. Face the machine, hinge forward slightly, and kick your leg straight back behind you, squeezing your glute at the peak. Execution: Kick back under strict control, squeezing your glutes. Breathing: Exhale as you kick back, inhale as you return. Tip: Focus on the glute contraction; do not swing your leg.' },
    { name: 'Bulgarian Split Squat', sets: '3', reps: '10', rest: '60s', instructions: 'Setup: Stand a couple of feet in front of a bench, placing one foot back on it. Lower your hips until your front thigh is parallel to the floor, then push back up through your front heel. Execution: Lower your hips under strict control, keeping your chest up and knee aligned with your toes. Breathing: Inhale as you lower, exhale as you stand up. Tip: Squeeze your glute at the top of the movement.' },
  ],
  Biceps: [
    { name: 'Dumbbell Bicep Curl', sets: '4', reps: '12', rest: '45s', instructions: 'Setup: Stand tall with feet hip-width apart holding dumbbells at your sides, palms facing forward. Execution: Keep your elbows pinned to your ribs, curl the dumbbells up to shoulder height, and squeeze your biceps hard. Lower the weights slowly to full extension. Breathing: Exhale as you curl up, inhale as you lower. Tip: Do not swing your hips or elbows forward to help lift the weights.' },
    { name: 'Hammer Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand holding dumbbells at your sides with your palms facing each other (neutral grip). Keep your chest tall. Execution: Keeping your elbows fixed at your sides, curl the dumbbells up to shoulder height while maintaining the neutral grip. Lower slowly. Breathing: Exhale as you curl, inhale as you lower. Tip: This targets the brachialis and forearms; keep your wrists completely straight.' },
    { name: 'Incline Dumbbell Curl', sets: '3', reps: '10', rest: '60s', instructions: 'Setup: Sit on an incline bench angled at 45 degrees, holding dumbbells. Let your arms hang straight down, palms facing forward. Execution: Keep your elbows fixed back, curl the weights up toward your shoulders, squeezing at the peak, then lower slowly. Breathing: Exhale as you curl, inhale as you lower. Tip: Keeping your elbows back keeps maximum tension on the long head of the bicep.' },
    { name: 'Cable Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand facing a low cable pulley with a straight bar or EZ-bar attachment. Hold the bar with an underhand grip, arms extended. Execution: Keep your elbows tucked, curl the bar up towards your shoulders, and squeeze. Lower under control. Breathing: Exhale as you curl, inhale as you lower. Tip: Lean forward slightly to maintain constant tension on the cable throughout.' },
  ],
  Triceps: [
    { name: 'Tricep Dips', sets: '4', reps: '12', rest: '45s', instructions: 'Setup: Mount a dip station and support your body weight with arms fully extended. Execution: Lean your torso forward slightly, bend your elbows, and lower your body until your shoulders are slightly below your elbows. Press back up to full lockout. Breathing: Inhale as you lower, exhale as you press back up. Tip: Keep your elbows tucked close to your body and avoid flaring them outwards.' },
    { name: 'Tricep Overhead Extension', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Sit or stand tall, holding a dumbbell overhead with both hands, arms extended straight up. Execution: Keep your upper arms locked still near your ears and slowly lower the dumbbell behind your head by bending your elbows. Press the weight back up to full extension. Breathing: Inhale as you lower, exhale as you press up. Tip: Keep your elbows tucked in; do not let them flare out wide.' },
    { name: 'Tricep Pushdowns', sets: '3', reps: '15', rest: '30s', instructions: 'Setup: Stand facing a high cable pulley with a rope or bar. Keep your elbows pinned to your sides and push the attachment down until arms are fully extended, squeezing the triceps. Execution: Press the bar/rope down until your arms are fully locked out at your sides. Slowly return to the starting position under control. Breathing: Exhale as you push down, inhale as you return. Tip: Do not lean your body weight on the attachment; let your triceps do all the work.' },
    { name: 'Close-grip Push-ups', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Set up in a plank position with hands closer than shoulder-width (under your chest). Keep your elbows tucked close to your ribs as you lower and press back up to target the triceps. Execution: Lower your chest until it touches your hands, then press back up to full lockout. Breathing: Inhale as you lower, exhale as you press up. Tip: Keep your body in a straight line from head to heels.' },
  ],
  Calves: [
    { name: 'Standing Calf Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Stand on a flat surface or the edge of a step, holding onto a wall for balance if needed. Execution: Press down through the balls of your feet and raise your heels as high as possible, squeezing your calves. Lower slowly. Breathing: Exhale as you lift, inhale as you lower. Tip: Pause at the top of each rep to maximize calf muscle contraction.' },
    { name: 'Seated Calf Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Sit in the calf raise machine with pads resting on your thighs. Lower your heels fully, then press up on the balls of your feet to contract the calves. Pause at the top. Execution: Complete the full range of motion. Breathing: Exhale on the way up, inhale on the way down. Tip: Do not bounce; use a controlled tempo.' },
    { name: 'Single-leg Calf Raises', sets: '3', reps: '12', rest: '30s', instructions: 'Setup: Stand on one leg on the edge of a step. Lower your heel fully, then lift up as high as possible on the ball of your foot. Complete sets on one side, then switch. Execution: Complete the full range of motion. Breathing: Exhale on the way up, inhale on the way down. Tip: Keep your torso upright and core engaged.' },
    { name: 'Box Jumps', sets: '3', reps: '10', rest: '60s', instructions: 'Setup: Stand in front of a sturdy box or bench, feet hip-width apart. Execution: Swing your arms and bend your knees, then explode upward to jump onto the box, landing softly in a squat position. Step down carefully. Breathing: Exhale explosively as you jump, inhale as you step down. Tip: Stand up tall at the top of the box to complete the rep before stepping down.' },
  ],
  Forearms: [
    { name: 'Wrist Curls', sets: '3', reps: '15', rest: '30s', instructions: 'Setup: Sit holding dumbbells with your forearms resting on your thighs, palms facing up. Let the weights roll down your fingers, then curl your wrists upward to lift them. Execution: Roll the dumbbells up to your palms, then curl. Breathing: Exhale on the way up, inhale on the way down. Tip: Keep your forearms flat against your thighs.' },
    { name: 'Reverse Wrist Curls', sets: '3', reps: '15', rest: '30s', instructions: 'Setup: Sit holding dumbbells with forearms on thighs, palms facing down. Curl your wrists upward to lift the weights, targeting the forearm extensors, and lower under control. Execution: Complete the full range of motion. Breathing: Exhale on the way up, inhale on the way down. Tip: Keep your forearms flat against your thighs.' },
    { name: "Farmer's Walk", sets: '3', duration: '45s', rest: '60s', instructions: 'Setup: Pick up heavy dumbbells in each hand. Stand tall with your chest up and shoulders pulled back, then walk in a straight line with slow, deliberate, stable steps. Execution: Walk for the designated duration. Breathing: Breathe deeply and steadily. Tip: Keep your core highly engaged to prevent the weights from swaying.' },
    { name: 'Plate Pinch Hold', sets: '3', duration: '30s', rest: '45s', instructions: 'Setup: Hold two weight plates flat-side out pinched together between your fingers and thumb. Lift them off the floor and hold for the targeted duration to build grip strength. Execution: Hold the plates as long as possible. Breathing: Breathe deeply and steadily. Tip: Keep your core highly engaged to prevent the weights from swaying.' },
  ],
  'Chest & Triceps': [
    { name: 'Barbell Bench Press', sets: '4', reps: '10', rest: '90s', instructions: 'Setup: Lie flat on a bench with your feet flat on the floor. Grip the barbell slightly wider than shoulder-width. Lift the bar off the rack. Execution: Lower the barbell under strict control to your mid-chest. Press the bar straight up explosively to full elbow extension. Breathing: Inhale as you lower the bar, exhale as you press it up. Tip: Squeeze your shoulder blades and drive your feet into the floor to build a solid foundation.' },
    { name: 'Incline Dumbbell Press', sets: '3', reps: '12', rest: '75s', instructions: 'Setup: Lie on a bench angled at 30 to 45 degrees, holding dumbbells at shoulder height, palms facing forward. Execution: Press the dumbbells straight up over your collarbone until your arms are fully extended. Lower the weights slowly and under control back to your shoulders. Breathing: Exhale on the press, inhale on the descent. Tip: Keep your elbows tucked at roughly 45 degrees relative to your torso to protect your shoulders.' },
    { name: 'Tricep Dips', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Mount a dip station and support your body weight with arms fully extended. Execution: Lean your torso forward slightly, bend your elbows, and lower your body until your shoulders are slightly below your elbows. Press back up to full lockout. Breathing: Inhale as you lower, exhale as you press back up. Tip: Keep your elbows tucked close to your body and avoid flaring them outwards.' },
    { name: 'Cable Tricep Pushdown', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Stand facing a high cable pulley with a rope or bar. Keep your elbows pinned to your sides and push the attachment down until arms are fully extended, squeezing the triceps. Execution: Press the bar/rope down until your arms are fully locked out at your sides. Slowly return to the starting position under control. Breathing: Exhale as you push down, inhale as you return. Tip: Do not lean your body weight on the attachment; let your triceps do all the work.' },
    { name: 'Dumbbell Flyes', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Lie flat on a bench holding dumbbells above your chest, palms facing each other. Keep a very slight bend in your elbows. Execution: Slowly lower the weights out to the sides in a wide arc until you feel a comfortable stretch in your chest. Reverse the arc to bring the dumbbells back to the starting position. Breathing: Inhale as you lower out, exhale as you bring the weights together. Tip: Do not bend your elbows further as you lower; keep the arm angle fixed.' },
  ],
  'Back & Biceps': [
    { name: 'Pull-ups', sets: '4', reps: '8', rest: '90s', instructions: 'Setup: Grasp the pull-up bar with an overhand grip (palms facing away), hands slightly wider than shoulder-width. Let your body hang. Execution: Pull your chest up toward the bar by driving your elbows down and back. Continue until your chin clears the bar, then slowly lower yourself to a full dead hang. Breathing: Exhale as you pull up, inhale as you lower down. Tip: Avoid swinging or using momentum; keep your core braced.' },
    { name: 'Barbell Bent-over Row', sets: '4', reps: '10', rest: '75s', instructions: 'Setup: Stand with feet hip-width apart holding a barbell. Hinge forward at your hips, keeping your back flat and knees slightly bent, until your torso is at a 45-degree angle. Execution: Row the barbell up towards your lower chest by driving your elbows high and back. Squeeze your upper back, then lower slowly. Breathing: Exhale as you row, inhale as you lower. Tip: Do not let your lower back round; keep your core braced throughout.' },
    { name: 'Dumbbell Bicep Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand tall with feet hip-width apart holding dumbbells at your sides, palms facing forward. Execution: Keep your elbows pinned to your ribs, curl the dumbbells up to shoulder height, and squeeze your biceps hard. Lower the weights slowly to full extension. Breathing: Exhale as you curl up, inhale as you lower. Tip: Do not swing your hips or elbows forward to help lift the weights.' },
    { name: 'Lat Pulldown', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Sit at a lat pulldown station and adjust the thigh pad. Grasp the bar with a wide overhand grip, arms fully extended, and lean back slightly. Execution: Pull the bar down to your upper chest by driving your elbows down towards your hips. Squeeze your lats, then release slowly. Breathing: Exhale as you pull down, inhale as you return. Tip: Focus on initiating the pull from your lats, not by pulling with your arms.' },
    { name: 'Hammer Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand holding dumbbells at your sides with your palms facing each other (neutral grip). Keep your chest tall. Execution: Keeping your elbows fixed at your sides, curl the dumbbells up to shoulder height while maintaining the neutral grip. Lower slowly. Breathing: Exhale as you curl, inhale as you lower. Tip: This targets the brachialis and forearms; keep your wrists completely straight.' },
  ],
  'Shoulders & Abs': [
    { name: 'Overhead Press', sets: '4', reps: '10', rest: '75s', instructions: 'Setup: Stand with feet shoulder-width apart, holding a barbell at collarbone height. Press the bar straight up over your head, pushing your head slightly forward at the top for full lockout. Lower the bar slowly to your chest. Breathing: Exhale as you press, inhale as you lower. Tip: Keep your path straight by pulling your chin back slightly as the bar passes.' },
    { name: 'Lateral Raises', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Stand tall holding dumbbells at your sides. Keep your chest up and shoulders down. Execution: Keeping a very slight bend in your elbows, raise your arms out to the sides until they are parallel to the floor, leading with your elbows. Lower slowly. Breathing: Exhale as you lift, inhale as you lower. Tip: Do not swing your body; keep the movement slow and controlled.' },
    { name: 'Plank', sets: '3', duration: '45s', rest: '30s', instructions: 'Setup: Rest your weight on your forearms and toes. Execution: Keep your body in a perfectly straight line from head to heels, engage your abs, glutes, and thighs, and hold while breathing. Breathing: Breathe deeply and continuously. Tip: Do not let your hips sag or raise your glutes high.' },
    { name: 'Face Pulls', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Attach a rope to a cable machine set at eye height. Grab the ends with an overhand grip, step back to lift the weight, and stand with a solid stance. Execution: Pull the center of the rope towards your nose, flaring your elbows high and out, while pulling the ends apart near your ears. Hold for 1 second. Breathing: Exhale as you pull, inhale as you return. Tip: Focus on squeezing your rear delts and upper back at the end range.' },
    { name: 'Hanging Leg Raises', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Hang from a pull-up bar. Keep your legs straight and lift them up using your core strength, then lower them slowly to prevent swinging. Execution: Complete the full range of motion. Breathing: Exhale as you lift, inhale as you lower. Tip: Squeeze your core at the top of the movement.' },
  ],
  'Chest & Shoulders': [
    { name: 'Barbell Bench Press', sets: '4', reps: '10', rest: '90s', instructions: 'Setup: Lie flat on a bench with your feet flat on the floor. Grip the barbell slightly wider than shoulder-width. Lift the bar off the rack. Execution: Lower the barbell under strict control to your mid-chest. Press the bar straight up explosively to full elbow extension. Breathing: Inhale as you lower the bar, exhale as you press it up. Tip: Squeeze your shoulder blades and drive your feet into the floor to build a solid foundation.' },
    { name: 'Overhead Press', sets: '4', reps: '10', rest: '75s', instructions: 'Setup: Stand with feet shoulder-width apart, holding a barbell at collarbone height. Press the bar straight up over your head, pushing your head slightly forward at the top for full lockout. Lower the bar slowly to your chest. Breathing: Exhale as you press, inhale as you lower. Tip: Keep your path straight by pulling your chin back slightly as the bar passes.' },
    { name: 'Incline Dumbbell Press', sets: '3', reps: '12', rest: '75s', instructions: 'Setup: Lie on a bench angled at 30 to 45 degrees, holding dumbbells at shoulder height, palms facing forward. Execution: Press the dumbbells straight up over your collarbone until your arms are fully extended. Lower the weights slowly and under control back to your shoulders. Breathing: Exhale on the press, inhale on the descent. Tip: Keep your elbows tucked at roughly 45 degrees relative to your torso to protect your shoulders.' },
    { name: 'Lateral Raises', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Stand tall holding dumbbells at your sides. Keep your chest up and shoulders down. Execution: Keeping a very slight bend in your elbows, raise your arms out to the sides until they are parallel to the floor, leading with your elbows. Lower slowly. Breathing: Exhale as you lift, inhale as you lower. Tip: Do not swing your body; keep the movement slow and controlled.' },
    { name: 'Cable Crossover', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Stand in the center of a dual cable machine with pulleys positioned high, holding the D-handles. Step forward slightly and lean forward. Execution: Keep a slight bend in your elbows and bring your hands down and together in a wide arc in front of your lower chest, squeezing your chest muscles. Slowly return. Breathing: Exhale as you cross your hands, inhale as you return. Tip: Focus on pushing your biceps against your outer chest at the end range.' },
  ],
  'Legs & Core': [
    { name: 'Barbell Squat', sets: '4', reps: '10', rest: '90s', instructions: 'Setup: Rest a barbell on your upper back. Place feet shoulder-width apart, squat down until thighs are parallel to the floor or lower, then drive through your heels to stand up. Execution: Lower your hips under strict control, keeping your knees pushed out and chest high, then push back up. Breathing: Inhale and brace your core at the top, hold through the descent, and exhale as you drive back up. Tip: Keep your feet flat on the floor and do not let your heels lift.' },
    { name: 'Romanian Deadlift', sets: '4', reps: '10', rest: '75s', instructions: 'Setup: Stand holding dumbbells or a bar. Hinge forward at your hips, keeping your back flat and knees slightly bent, lowering the weights along your thighs. Squeeze glutes to stand. Execution: Slowly lower the weights along your shins until you feel a deep stretch in your hamstrings, keeping your back perfectly straight. Squeeze your glutes and hamstrings to return to standing. Breathing: Inhale as you lower, exhale as you stand up. Tip: Keep the weights close to your legs throughout the movement to protect your lower back.' },
    { name: 'Cable Woodchops', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand sideways to a pulley set high. Grab the handle with both hands, pull it diagonally across and down your body while rotating your torso, then return slowly. Execution: Complete the rotation under control. Breathing: Exhale as you chop, inhale as you return. Tip: Focus on rotating from your core, not just using your arms.' },
    { name: 'Walking Lunges', sets: '3', reps: '12', rest: '60s', instructions: 'Setup: Stand tall with your feet hip-width apart and hands on your hips. Execution: Step forward with one leg, bending both knees to 90 degrees to lower your hips. Press off your front foot and step your back foot forward to meet the front, or step directly into the next lunge. Breathing: Inhale as you lower into the lunge, exhale as you push up and step forward. Tip: Keep your front knee stacked over your ankle and your chest upright.' },
    { name: 'Ab Wheel Rollout', sets: '3', reps: '10', rest: '45s', instructions: 'Setup: Kneel on the floor, holding the ab wheel handles directly under your shoulders. Execution: Slowly roll the wheel forward, extending your body as far as possible without dropping your hips, then pull back using your core. Breathing: Inhale as you roll out, exhale as you pull back. Tip: Keep a slight round in your upper back (hollow body position) to engage your rectus abdominis.' },
  ],
  'Back & Rear Delts': [
    { name: 'Deadlift', sets: '4', reps: '8', rest: '120s', instructions: 'Setup: Stand with feet hip-width apart under the barbell, shin 1 inch from the bar. Hinge down, grip the bar at shoulder-width, flatten your back, and drop your hips slightly. Execution: Push the floor away with your legs, standing up tall. Pull the bar in a straight line close to your body, squeezing your glutes at the top. Lower under control. Breathing: Inhale and brace at the bottom, hold your breath during the lift, exhale at the top. Tip: Keep your spine perfectly neutral; do not round your back.' },
    { name: 'Face Pulls', sets: '4', reps: '15', rest: '45s', instructions: 'Setup: Attach a rope to a cable machine set at eye height. Grab the ends with an overhand grip, step back to lift the weight, and stand with a solid stance. Execution: Pull the center of the rope towards your nose, flaring your elbows high and out, while pulling the ends apart near your ears. Hold for 1 second. Breathing: Exhale as you pull, inhale as you return. Tip: Focus on squeezing your rear delts and upper back at the end range.' },
    { name: 'Dumbbell Row', sets: '4', reps: '12', rest: '60s', instructions: 'Setup: Place one knee and your same-side hand flat on a bench for support, keeping your back flat and parallel to the floor. Hold a dumbbell in your other hand, arm hanging straight down. Execution: Pull your elbow up and back towards your hip, squeezing your shoulder blade at the top of the movement. Lower the dumbbell slowly to the starting position. Breathing: Exhale as you pull the weight up, inhale as you lower it. Tip: Pull with your back muscles rather than your biceps, keeping your elbow tucked close.' },
    { name: 'Reverse Pec Deck / Band Pull-aparts', sets: '3', reps: '15', rest: '45s', instructions: 'Setup: Sit facing the pec deck machine or hold a resistance band. Pull your arms back and out in a wide arc, squeezing your rear delts at the peak of contraction. Execution: Complete the rotation under control. Breathing: Exhale as you pull, inhale as you return. Tip: Keep your shoulders depressed to target the rear delts.' },
    { name: 'Pull-ups', sets: '3', reps: '8', rest: '75s', instructions: 'Setup: Grasp the pull-up bar with an overhand grip (palms facing away), hands slightly wider than shoulder-width. Let your body hang. Execution: Pull your chest up toward the bar by driving your elbows down and back. Continue until your chin clears the bar, then slowly lower yourself to a full dead hang. Breathing: Exhale as you pull up, inhale as you lower down. Tip: Avoid swinging or using momentum; keep your core braced.' },
  ],
  'Arms & Core': [
    { name: 'Dumbbell Bicep Curl', sets: '4', reps: '12', rest: '45s', instructions: 'Setup: Stand tall with feet hip-width apart holding dumbbells at your sides, palms facing forward. Execution: Keep your elbows pinned to your ribs, curl the dumbbells up to shoulder height, and squeeze your biceps hard. Lower the weights slowly to full extension. Breathing: Exhale as you curl up, inhale as you lower. Tip: Do not swing your hips or elbows forward to help lift the weights.' },
    { name: 'Tricep Dips', sets: '4', reps: '12', rest: '45s', instructions: 'Setup: Mount a dip station and support your body weight with arms fully extended. Execution: Lean your torso forward slightly, bend your elbows, and lower your body until your shoulders are slightly below your elbows. Press back up to full lockout. Breathing: Inhale as you lower, exhale as you press back up. Tip: Keep your elbows tucked close to your body and avoid flaring them outwards.' },
    { name: 'Hanging Knee Raises', sets: '3', reps: '15', rest: '30s', instructions: 'Setup: Hang from a bar, keep your knees bent at 90 degrees and pull them up toward your chest using your lower abs, then lower with control to prevent swinging. Execution: Complete the full range of motion. Breathing: Exhale as you lift, inhale as you lower. Tip: Squeeze your core at the top of the movement.' },
    { name: 'Hammer Curl', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Stand holding dumbbells at your sides with your palms facing each other (neutral grip). Keep your chest tall. Execution: Keeping your elbows fixed at your sides, curl the dumbbells up to shoulder height while maintaining the neutral grip. Lower slowly. Breathing: Exhale as you curl, inhale as you lower. Tip: This targets the brachialis and forearms; keep your wrists completely straight.' },
    { name: 'Tricep Overhead Extension', sets: '3', reps: '12', rest: '45s', instructions: 'Setup: Sit or stand tall, holding a dumbbell overhead with both hands, arms extended straight up. Execution: Keep your upper arms locked still near your ears and slowly lower the dumbbell behind your head by bending your elbows. Press the weight back up to full extension. Breathing: Inhale as you lower, exhale as you press up. Tip: Keep your elbows tucked in; do not let them flare out wide.' },
  ],
  Rest: [],
};

const WARMUP = [
  { name: 'Jumping Jacks', sets: '1', duration: '90s', reps: null, rest: '15s', instructions: 'Setup: Stand with feet together and arms at your sides. Execution: In one fluid motion, jump your feet out to the sides while raising your arms above your head. Immediately jump back to the starting position and repeat rapidly. Breathing: Breathe in a quick, steady, rhythmic pattern throughout the movement. Tip: Keep your heels light and land softly on the balls of your feet.' },
  { name: 'Arm Circles', sets: '1', duration: '45s', reps: null, rest: '10s', instructions: 'Setup: Stand with feet shoulder-width apart and extend arms straight out at shoulder height. Execution: Make slow, controlled circular motions with your arms, reversing directions halfway through. Breathing: Breathe deeply and slowly. Tip: Keep your shoulders relaxed and down, away from your ears.' },
  { name: 'Leg Swings', sets: '1', duration: '45s', reps: null, rest: '10s', instructions: 'Setup: Stand tall near a wall or sturdy object for support. Execution: Swing one leg forward and backward in a smooth, controlled motion, gradually increasing the range. Complete all reps, then switch legs. Breathing: Breathe naturally. Tip: Keep your core braced and do not let your torso twist or sway.' },
];

const COOLDOWN = [
  { name: "Child's Pose", sets: '1', duration: '60s', reps: null, rest: '0s', instructions: 'Setup: Kneel on the floor, touch big toes together, sit on your heels, and separate knees. Execution: Fold forward, extend your arms along the floor, and rest your forehead, taking deep belly breaths. Breathing: Breathe deeply through your nose, expanding your belly and lower back. Tip: Let your hips sink fully into your heels and relax your shoulders.' },
  { name: 'Seated Hamstring Stretch', sets: '1', duration: '45s', reps: null, rest: '0s', instructions: 'Setup: Sit on the floor with one leg extended and other foot against inner thigh. Execution: Hinge at hips, reach toward extended foot with flat back, and hold gently without bouncing. Switch legs. Breathing: Inhale to find length, exhale to melt deeper into the stretch. Tip: Keep your chest tall and do not round your upper back.' },
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
