import type { Metadata } from "next";
import PlannerPage from "@/components/PlannerPage";

export const metadata: Metadata = {
  title: "Single Session - Regimen AI",
  description: "Generate one focused AI workout session.",
};

export default function SessionPage() {
  return <PlannerPage mode="single" />;
}
