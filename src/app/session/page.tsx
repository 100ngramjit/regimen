import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import PlannerPage from "@/components/PlannerPage";

export const metadata: Metadata = {
  title: "Single Session - Regimen AI",
  description: "Generate one focused AI workout session.",
};

export default async function SessionPage() {
  const { user } = await withAuth({ ensureSignedIn: false });

  if (!user) {
    redirect("/api/auth/login");
  }

  return <PlannerPage mode="single" />;
}
