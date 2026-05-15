import { withAuth } from "@workos-inc/authkit-nextjs";
import AuthWall from "@/components/AuthWall";
import HomeClient, { type PlannerMode } from "@/components/HomeClient";

interface PlannerPageProps {
  mode: PlannerMode;
}

export default async function PlannerPage({ mode }: PlannerPageProps) {
  const { user } = await withAuth();

  if (!user) {
    return <AuthWall />;
  }

  return <HomeClient mode={mode} />;
}
