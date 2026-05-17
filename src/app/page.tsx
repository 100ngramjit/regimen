import LandingPage from '@/components/landing/LandingPage';
import { withAuth } from '@workos-inc/authkit-nextjs';

export default async function Home() {
  const { user } = await withAuth({ ensureSignedIn: false });

  return <LandingPage isAuthenticated={!!user} />;
}
