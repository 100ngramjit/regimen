import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { workouts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const { user } = await withAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, user.id))
    .orderBy(desc(workouts.createdAt));

  const parsed = userWorkouts.map((w) => {
    const content = JSON.parse(w.content);
    const isWeekly = content && 'days' in content;
    const title = isWeekly
      ? content.weekTitle || 'Weekly Plan'
      : content.title || 'Workout';
    return {
      id: w.id,
      type: isWeekly ? 'weekly' : 'session',
      title,
      content,
      createdAt: w.createdAt,
    };
  });

  return NextResponse.json(parsed);
}
