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
import {
  Zap,
  CalendarDays,
  Clock3,
  Hammer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type PlannerMode = "single" | "weekly";

interface HomeClientProps {
  mode: PlannerMode;
}

const MODE_LINKS: {
  value: PlannerMode;
  href: string;
  label: string;
  shortLabel: string;
  icon: typeof CalendarDays;
}[] = [
  {
    value: "weekly",
    href: "/weekly",
    label: "Weekly Plan",
    shortLabel: "Weekly",
    icon: CalendarDays,
  },
  {
    value: "single",
    href: "/session",
    label: "Single Session",
    shortLabel: "Single",
    icon: Zap,
  },
];

export default function HomeClient({ mode }: HomeClientProps) {
  const [workout, setWorkout, isLoadingWorkout] = useDbState<Workout | null>(
    "ff-last-workout",
    null,
  );
  const [weeklyPlan, setWeeklyPlan, isLoadingWeekly] = useDbState<WeeklyPlan | null>(
    "ff-last-weekly",
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<{ count: number; limit: number; remaining: number } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [reforgeMode, setReforgeMode] = useState<PlannerMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSingleReq, setLastSingleReq] = useDbState<WorkoutRequest | null>(
    "ff-last-single-req",
    null,
  );
  const [, setLastWeeklyReq] =
    useDbState<WeeklyPlanRequest | null>("ff-last-weekly-req", null);

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
    !isInitialLoading && ((mode === "weekly" && weeklyPlan) || (mode === "single" && workout));
  const isReforging = reforgeMode === mode;
  const showForm = !showResult || isReforging;
  const description =
    mode === "weekly"
      ? "Set the training rhythm, constraints, and equipment once, then get a complete split with rest built in."
      : "Dial in your goal, time, and equipment for a focused workout you can start immediately.";
  const resultLabel = mode === "weekly" ? "Weekly plan" : "Workout";
  const formTitle =
    mode === "weekly"
      ? isReforging
        ? "Reforge Your Week"
        : "Plan Your Week"
      : isReforging
        ? "Reforge Session"
        : "Generate a Session";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <main className="flex flex-1 flex-col items-center px-5 py-6 md:py-10">
        <div className="flex w-full max-w-6xl flex-col gap-6">
          <div className="w-full space-y-10">
            <div className="flex flex-col gap-4 rounded-lg border border-border/40 bg-card/35 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 gap-2 sm:w-auto">
                {MODE_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.value;
                  return (
                    <Link
                      key={item.value}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-12 items-center justify-center gap-2 rounded-md px-4 text-xs font-black uppercase tracking-[0.14em] transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="hidden min-[420px]:inline">{item.label}</span>
                      <span className="min-[420px]:hidden">{item.shortLabel}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground">
                  <Clock3 size={15} className="text-primary" />
                  {showResult
                    ? `${resultLabel} ready`
                    : "Your inputs autosave as you go."}
                </div>
                {showResult && !showForm && (
                  <Button
                    type="button"
                    onClick={beginReforge}
                    size="sm"
                    className="h-10 gap-2 rounded-md text-xs font-black uppercase tracking-[0.14em]"
                  >
                    <Hammer size={15} />
                    Reforge
                  </Button>
                )}
              </div>
            </div>

            {isInitialLoading ? (
              <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
                <Card className="overflow-hidden border-border/40 bg-card/55 shadow-xl backdrop-blur-sm">
                  <CardHeader className="pb-6 pt-7 sm:px-8">
                    <div className="h-10 w-1/3 animate-pulse rounded-lg bg-muted/30" />
                    <div className="mt-2 h-6 w-2/3 animate-pulse rounded-lg bg-muted/20" />
                  </CardHeader>
                  <CardContent className="space-y-6 pb-8 sm:px-8">
                    <div className="h-32 w-full animate-pulse rounded-xl bg-muted/10" />
                    <div className="h-32 w-full animate-pulse rounded-xl bg-muted/10" />
                  </CardContent>
                </Card>
                <aside className="space-y-4">
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                      <Hammer size={15} className="text-primary animate-spin" />
                      Scanning database...
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-3/4 animate-pulse rounded-md bg-primary/10" />
                      <div className="h-4 w-full animate-pulse rounded-md bg-muted/30" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-card/35 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                      <Zap size={15} className="text-primary" />
                      Daily Allowance
                    </div>
                    {isLoadingUsage ? (
                      <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/30" />
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black tracking-tight text-primary">
                            {usage?.remaining ?? 0}
                          </span>
                          <span className="mb-1 text-xs font-bold text-muted-foreground">
                            OF {usage?.limit ?? 2} LEFT
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((usage?.remaining ?? 0) / (usage?.limit ?? 2)) * 100}%` }}
                            className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border/40 bg-card/35 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                      Good prompts
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Mention injuries, disliked movements, available machines,
                      target muscles, and how hard you want the session to feel.
                    </p>
                  </div>
                </aside>
              </section>
            ) : showForm && (
              <section
                id="composer"
                className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${mode}-${isReforging ? "reforge" : "new"}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-border/40 bg-card/55 shadow-xl backdrop-blur-sm">
                      <CardHeader className="pb-6 pt-7 sm:px-8">
                        <CardTitle className="text-3xl font-black tracking-tight sm:text-4xl">
                          {formTitle}
                        </CardTitle>
                        <CardDescription className="max-w-2xl text-base">
                          {description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-8 sm:px-8">
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
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                      <Hammer size={15} className="text-primary" />
                      {isInitialLoading ? "Scanning database..." : showResult ? "Reforge mode" : "Current output"}
                    </div>
                    {isInitialLoading ? (
                      <div className="space-y-2">
                        <div className="h-8 w-3/4 animate-pulse rounded-md bg-primary/10" />
                        <div className="h-4 w-full animate-pulse rounded-md bg-muted/30" />
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-black tracking-tight">
                          {showResult ? "Tune and replace" : "No plan yet"}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {showResult
                            ? "Update your constraints, generate again, and the new result will replace the current one."
                            : "Generate once and this panel becomes your launch point for reviewing the result."}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="rounded-lg border border-border/40 bg-card/35 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                      <Zap size={15} className="text-primary" />
                      Daily Allowance
                    </div>
                    {isLoadingUsage ? (
                      <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/30" />
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black tracking-tight text-primary">
                            {usage?.remaining ?? 0}
                          </span>
                          <span className="mb-1 text-xs font-bold text-muted-foreground">
                            OF {usage?.limit ?? 2} LEFT
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((usage?.remaining ?? 0) / (usage?.limit ?? 2)) * 100}%` }}
                            className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                          />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Resets at midnight
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border/40 bg-card/35 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                      Good prompts
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Mention injuries, disliked movements, available machines,
                      target muscles, and how hard you want the session to feel.
                    </p>
                  </div>
                </aside>
              </section>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/50 bg-destructive/10 px-5 py-4 text-center text-sm font-medium text-destructive backdrop-blur-md"
              >
                {error}
              </motion.div>
            )}

            {/* Result Area */}
            {showResult && (
              <motion.div
                id="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card className="overflow-hidden border-primary/20 bg-card/60 shadow-2xl ring-1 ring-primary/10 backdrop-blur-md">
                  <CardHeader className="border-b border-border/40 pb-6 pt-8">
                    <div>
                      <CardTitle className="text-3xl font-black tracking-tight">
                        Your Regimen
                      </CardTitle>
                      <CardDescription className="text-base">
                        Optimized and ready for execution.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="py-6 sm:py-10">
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
            )}
          </div>
        </div>
      </main>


      <footer className="mt-auto border-t border-border/40 py-12 sm:py-16 text-center px-6">
        <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.6em] uppercase text-muted-foreground/60 leading-relaxed">
          2026 Regimen AI · Scientific Excellence in Training
        </p>
      </footer>
    </div>
  );
}
