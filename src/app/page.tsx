import { withAuth } from '@workos-inc/authkit-nextjs';
import AuthWall from '@/components/AuthWall';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { user } = await withAuth();

  if (!user) {
    return <AuthWall />;
  }

  redirect('/weekly');
}
