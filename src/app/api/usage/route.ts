import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { workouts } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { user } = await withAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  return NextResponse.json({ 
    count: userWorkoutsToday.length,
    limit: 2,
    remaining: Math.max(0, 2 - userWorkoutsToday.length)
  });
}
