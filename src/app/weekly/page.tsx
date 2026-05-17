import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import PlannerPage from "@/components/PlannerPage";

export const metadata: Metadata = {
  title: "Weekly Plan - Regimen AI",
  description: "Build a complete AI-generated weekly training plan.",
};

export default async function WeeklyPage() {
  const { user } = await withAuth({ ensureSignedIn: false });

  if (!user) {
    redirect("/api/auth/login");
  }

  return <PlannerPage mode="weekly" />;
}
