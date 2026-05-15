import { withAuth } from '@workos-inc/authkit-nextjs';
import HomeClient from '@/components/HomeClient';
import AuthWall from '@/components/AuthWall';

export default async function Home() {
  const { user } = await withAuth();

  if (!user) {
    return <AuthWall />;
  }

  return <HomeClient />;
}
