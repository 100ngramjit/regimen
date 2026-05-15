import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { userStates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { user } = await withAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = req.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const state = await db.query.userStates.findFirst({
    where: and(eq(userStates.userId, user.id), eq(userStates.key, key)),
  });

  return NextResponse.json({ value: state ? JSON.parse(state.value) : null });
}

export async function POST(req: NextRequest) {
  const { user } = await withAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  await db.insert(userStates)
    .values({
      userId: user.id,
      key,
      value: JSON.stringify(value),
    })
    .onConflictDoUpdate({
      target: [userStates.userId, userStates.key],
      set: { value: JSON.stringify(value), updatedAt: new Date() },
    });

  return NextResponse.json({ success: true });
}
