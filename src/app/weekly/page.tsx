import type { Metadata } from "next";
import PlannerPage from "@/components/PlannerPage";

export const metadata: Metadata = {
  title: "Weekly Plan - Regimen AI",
  description: "Build a complete AI-generated weekly training plan.",
};

export default function WeeklyPage() {
  return <PlannerPage mode="weekly" />;
}
