import HomeClient, { type PlannerMode } from "@/components/HomeClient";

interface PlannerPageProps {
  mode: PlannerMode;
}

export default function PlannerPage({ mode }: PlannerPageProps) {
  return <HomeClient mode={mode} />;
}
