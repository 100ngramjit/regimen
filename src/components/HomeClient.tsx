"use client";

import React, { useState, useEffect } from "react";
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
  weeklyPlanToMarkdown,
  workoutToMarkdown,
  weeklyPlanToText,
  workoutToText,
  weeklyPlanToHtml,
  workoutToHtml,
  downloadMarkdown,
  downloadFile,
  buildShareUrl,
  copyToClipboard,
  downloadPdf,
} from "@/lib/export";
import {
  Zap,
  CalendarDays,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

type Mode = "single" | "weekly";

export default function HomeClient() {
  const [mode, setMode] = useDbState<Mode>("ff-mode", "weekly");
  const [workout, setWorkout] = useDbState<Workout | null>(
    "ff-last-workout",
    null,
  );
  const [weeklyPlan, setWeeklyPlan] = useDbState<WeeklyPlan | null>(
    "ff-last-weekly",
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSingleReq, setLastSingleReq] = useDbState<WorkoutRequest | null>(
    "ff-last-single-req",
    null,
  );
  const [lastWeeklyReq, setLastWeeklyReq] =
    useDbState<WeeklyPlanRequest | null>("ff-last-weekly-req", null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

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

  const handleExportMd = () => {
    if (mode === "weekly" && weeklyPlan)
      downloadMarkdown(
        weeklyPlanToMarkdown(weeklyPlan),
        "regimen-weekly-plan.md",
      );
    else if (mode === "single" && workout)
      downloadMarkdown(workoutToMarkdown(workout), "regimen-workout.md");
  };

  const handleExportTxt = () => {
    if (mode === "weekly" && weeklyPlan)
      downloadFile(
        weeklyPlanToText(weeklyPlan),
        "regimen-weekly-plan.txt",
        "text/plain",
      );
    else if (mode === "single" && workout)
      downloadFile(workoutToText(workout), "regimen-workout.txt", "text/plain");
  };

  const handleExportHtml = () => {
    if (mode === "weekly" && weeklyPlan)
      downloadFile(
        weeklyPlanToHtml(weeklyPlan),
        "regimen-weekly-plan.html",
        "text/html",
      );
    else if (mode === "single" && workout)
      downloadFile(workoutToHtml(workout), "regimen-workout.html", "text/html");
  };

  const handleExportPdf = () => {
    if (mode === "weekly" && weeklyPlan)
      downloadPdf(weeklyPlanToHtml(weeklyPlan), "regimen-weekly-plan.pdf");
    else if (mode === "single" && workout)
      downloadPdf(workoutToHtml(workout), "regimen-workout.pdf");
  };

  const handleShare = async () => {
    const data = mode === "weekly" ? weeklyPlan : workout;
    if (!data) return;
    const url = buildShareUrl(data, mode);
    const ok = await copyToClipboard(url);
    setToast(ok ? "✓ Link copied to clipboard!" : "Could not copy link.");
  };

  const adjustWorkout = (type: "harder" | "easier") => {
    if (!lastSingleReq) return;
    generateWorkout({
      ...lastSingleReq,
      notes: `${lastSingleReq.notes || ""} Make it ${type}.`,
    });
  };

  const showResult =
    (mode === "weekly" && weeklyPlan) || (mode === "single" && workout);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <main className="flex flex-1 flex-col items-center px-5 py-8 md:py-24">
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* ── Hero ── */}
          <section className="mb-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
            >
              <Sparkles size={14} /> AI-Powered Personal Training
            </motion.div>

            <h1 className="mb-6 text-4xl font-black leading-[1.1] tracking-tight sm:text-8xl">
              Precision Fitness
              <br />
              <AnimatedShinyText shimmerWidth={350}>
                zero bullshit
              </AnimatedShinyText>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Elite training programs tailored to your unique biology,
              environment, and goals. Precision fitness for the driven.
            </p>
          </section>

          {/* ── Main Panel ── */}
          <div className="w-full space-y-12">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as Mode)}
              className="w-full"
            >
              <div className="flex justify-center mb-10">
                <TabsList className="grid w-full max-w-sm grid-cols-2 h-12">
                  <TabsTrigger
                    value="weekly"
                    className="gap-2 text-xs font-bold"
                  >
                    <CalendarDays size={16} className="shrink-0" />
                    <span className="hidden xs:inline">Weekly Plan</span>
                    <span className="xs:hidden">Weekly</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="single"
                    className="gap-2 text-xs font-bold"
                  >
                    <Zap size={16} className="shrink-0" />
                    <span className="hidden xs:inline">Single Session</span>
                    <span className="xs:hidden">Single</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                    <CardHeader className="text-center pb-10 pt-10">
                      <CardTitle className="text-4xl font-black tracking-tight">
                        {mode === "weekly"
                          ? "Plan Your Week"
                          : "Generate a Session"}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Fill in your preferences and let our AI build the
                        perfect workout for you.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-10">
                      <TabsContent value="weekly" className="mt-0">
                        <WeeklyPlanForm
                          onGenerate={generateWeekly}
                          isLoading={isLoading}
                        />
                      </TabsContent>
                      <TabsContent value="single" className="mt-0">
                        <WorkoutForm
                          onGenerate={generateWorkout}
                          isLoading={isLoading}
                        />
                      </TabsContent>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </Tabs>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/50 bg-destructive/10 px-5 py-4 text-center text-sm font-medium text-destructive backdrop-blur-md"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Result Area */}
            {showResult && (
              <motion.div
                id="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16"
              >
                <Card className="border-primary/20 bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-6 pt-8">
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
                        onRegenerate={() =>
                          lastWeeklyReq && generateWeekly(lastWeeklyReq)
                        }
                        onExportMd={handleExportMd}
                        onExportTxt={handleExportTxt}
                        onExportHtml={handleExportHtml}
                        onExportPdf={handleExportPdf}
                        onShare={handleShare}
                      />
                    ) : mode === "single" && workout ? (
                      <WorkoutDisplay
                        workout={workout}
                        onRegenerate={() =>
                          lastSingleReq && generateWorkout(lastSingleReq)
                        }
                        onAdjust={adjustWorkout}
                        onExportMd={handleExportMd}
                        onExportTxt={handleExportTxt}
                        onExportHtml={handleExportHtml}
                        onExportPdf={handleExportPdf}
                        onShare={handleShare}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 flex items-center gap-3 rounded-2xl border border-primary/30 bg-background/80 px-6 py-4 text-sm font-bold text-primary shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 size={18} className="text-accent" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto border-t border-border/40 py-12 sm:py-16 text-center px-6">
        <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.6em] uppercase text-muted-foreground/60 leading-relaxed">
          © 2026 Regimen AI · Scientific Excellence in Training
        </p>
      </footer>
    </div>
  );
}
