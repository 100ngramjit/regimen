"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDbState } from "@/lib/use-db-state";
import WorkoutForm from "@/components/WorkoutForm";
import WorkoutDisplay from "@/components/WorkoutDisplay";
import WeeklyPlanForm from "@/components/WeeklyPlanForm";
import WeeklyPlanDisplay from "@/components/WeeklyPlanDisplay";
import {
  Workout,
  WorkoutRequest,
  WeeklyPlan,
  WeeklyPlanRequest,
} from "@/lib/schemas";
import { Zap, CalendarDays, Hammer, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import UsageCard from "@/components/UsageCard";

export type PlannerMode = "single" | "weekly";

interface HomeClientProps {
  mode: PlannerMode;
}

const MODE_LINKS: {
  value: PlannerMode;
  href: string;
  label: string;
  icon: typeof CalendarDays;
}[] = [
  {
    value: "weekly",
    href: "/weekly",
    label: "Weekly Plan",
    icon: CalendarDays,
  },
  {
    value: "single",
    href: "/session",
    label: "Single Session",
    icon: Zap,
  },
];

export default function HomeClient({ mode }: HomeClientProps) {
  const [workout, setWorkout, isLoadingWorkout] = useDbState<Workout | null>(
    "regimen:workout:latest:result",
    null,
  );
  const [weeklyPlan, setWeeklyPlan, isLoadingWeekly] =
    useDbState<WeeklyPlan | null>("regimen:weekly:latest:result", null);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<{
    count: number;
    limit: number;
    remaining: number;
  } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [reforgeMode, setReforgeMode] = useState<PlannerMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSingleReq, setLastSingleReq] = useDbState<WorkoutRequest | null>(
    "regimen:workout:latest:request",
    null,
  );
  const [, setLastWeeklyReq] = useDbState<WeeklyPlanRequest | null>(
    "regimen:weekly:latest:request",
    null,
  );

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.error("Failed to fetch usage:", e);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  React.useEffect(() => {
    fetchUsage();
  }, []);

  const generateWorkout = async (data: WorkoutRequest) => {
    setIsLoading(true);
    setError(null);
    setLastSingleReq(data);
    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 429) {
        throw new Error(
          "Too many requests. Please wait a moment before forging again.",
        );
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "The server returned an invalid response. Please try again later.",
        );
      }

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to generate workout");
      setWorkout(result);
      fetchUsage();
      setReforgeMode(null);
      setTimeout(
        () =>
          document
            .getElementById("result")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeekly = async (data: WeeklyPlanRequest) => {
    setIsLoading(true);
    setError(null);
    setLastWeeklyReq(data);
    try {
      const res = await fetch("/api/generate-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 429) {
        throw new Error("Rate limit exceeded. Give the AI a minute to rest!");
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response format.");
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to generate plan");
      setWeeklyPlan(result);
      fetchUsage();
      setReforgeMode(null);
      setTimeout(
        () =>
          document
            .getElementById("result")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const adjustWorkout = (type: "harder" | "easier") => {
    if (!lastSingleReq) return;
    generateWorkout({
      ...lastSingleReq,
      notes: `${lastSingleReq.notes || ""} Make it ${type}.`,
    });
  };

  const beginReforge = () => {
    setReforgeMode(mode);
    setTimeout(
      () =>
        document
          .getElementById("composer")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const isInitialLoading = isLoadingWorkout || isLoadingWeekly;
  const showResult =
    !isInitialLoading &&
    ((mode === "weekly" && weeklyPlan) || (mode === "single" && workout));
  const isReforging = reforgeMode === mode;
  const showForm = !showResult || isReforging;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 py-6 md:py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Mode switcher */}
          <div className="flex items-center justify-center gap-1 rounded-xl border border-border/40 bg-card/30 p-1 w-fit mx-auto shadow-sm">
            {MODE_LINKS.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.value;
              return (
                <Link
                  key={m.value}
                  href={m.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{m.label}</span>
                  <span className="sm:hidden">
                    {m.label.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isInitialLoading ? (
            <div className="grid gap-8 xl:grid-cols-[1fr_300px] xl:items-start">
              <Card className="border-border/40 shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted/30" />
                  <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted/20" />
                  <div className="h-40 w-full animate-pulse rounded-xl bg-muted/10" />
                  <div className="h-40 w-full animate-pulse rounded-xl bg-muted/10" />
                </CardContent>
              </Card>
              <aside className="space-y-4">
                <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Hammer size={14} className="text-primary animate-spin" />
                    Loading...
                  </div>
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted/30" />
                </div>
                <UsageCard usage={usage} isLoading={isLoadingUsage} />
              </aside>
            </div>
          ) : (
            <>
              {/* Form and sidebar */}
              {showForm && (
                <section
                  id="composer"
                  className="grid gap-8 xl:grid-cols-[1fr_300px] xl:items-start"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${mode}-${isReforging ? "reforge" : "new"}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-border/40 shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                          <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                              {mode === "weekly"
                                ? isReforging
                                  ? "Reforge Your Week"
                                  : "Plan Your Week"
                                : isReforging
                                  ? "Reforge Session"
                                  : "New Session"}
                            </h1>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {mode === "weekly"
                                ? "Configure your weekly split, then let AI build your regimen."
                                : "Set your preferences and get a tailored workout."}
                            </p>
                          </div>
                          {mode === "weekly" ? (
                            <WeeklyPlanForm
                              onGenerate={generateWeekly}
                              isLoading={isLoading}
                            />
                          ) : (
                            <WorkoutForm
                              onGenerate={generateWorkout}
                              isLoading={isLoading}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>

                  <aside className="space-y-4">
                    <div className="rounded-xl border border-border/40 bg-card/30 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Hammer size={14} className="text-primary" />
                        {isReforging ? "Refining" : "Ready"}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {showResult
                          ? "Update your constraints below and regenerate."
                          : "Fill in your preferences and generate a workout plan."}
                      </p>
                    </div>
                    <UsageCard usage={usage} isLoading={isLoadingUsage} />
                    <div className="rounded-xl border border-border/40 bg-card/30 p-5 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Pro Tips
                      </p>
                      <ul className="text-sm text-muted-foreground/80 space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">·</span>
                          Mention injuries or limitations
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">·</span>
                          Specify target muscle groups
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">·</span>
                          Set desired intensity level
                        </li>
                      </ul>
                    </div>
                  </aside>
                </section>
              )}

              {/* Result */}
              {showResult && (
                <section className="grid gap-8 xl:grid-cols-[1fr_300px] xl:items-start">
                  <motion.div
                    id="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-primary/10 shadow-md ring-1 ring-primary/5">
                      <CardContent className="p-6 sm:p-8">
                        {mode === "weekly" && weeklyPlan ? (
                          <WeeklyPlanDisplay
                            plan={weeklyPlan}
                            onRegenerate={beginReforge}
                          />
                        ) : mode === "single" && workout ? (
                          <WorkoutDisplay
                            workout={workout}
                            onRegenerate={beginReforge}
                            onAdjust={adjustWorkout}
                          />
                        ) : null}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <aside className="space-y-4">
                    <UsageCard usage={usage} isLoading={isLoadingUsage} />
                  </aside>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-border/30 py-10 text-center px-6">
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground/50">
          2026 Regimen AI
        </p>
      </footer>
    </div>
  );
}
