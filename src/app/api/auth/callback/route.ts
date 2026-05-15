import { handleAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = handleAuth({
  returnPathname: '/',
  async onSuccess({ user }) {
    // Sync user to database
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      if (!existingUser) {
        await db.insert(users).values({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
        });
      } else {
        // Update existing user info if it changed
        await db.update(users)
          .set({
            firstName: user.firstName,
            lastName: user.lastName,
            profilePictureUrl: user.profilePictureUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      }
    } catch (error) {
      console.error('Failed to sync user to database:', error);
    }
  },
});
