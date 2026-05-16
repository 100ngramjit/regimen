"use client";

import React, { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/schemas";
import {
  Clock,
  ChevronDown,
  Moon,
  Zap,
  Dumbbell,
  Timer,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PlanActions from "@/components/PlanActions";

interface Props {
  plan: WeeklyPlan;
  onRegenerate: () => void;
}

const FOCUS_COLORS: Record<string, string> = {
  Rest: "bg-muted text-muted-foreground border-border/40",
  Push: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/30",
  Pull: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/30",
  Legs: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/30",
  "Full Body": "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/30",
  "Upper Body": "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/30",
  "Lower Body": "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800/30",
  Core: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/30",
  Cardio: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800/30",
  Arms: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/30",
  Back: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800/30",
  Chest: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/30",
  Shoulders: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800/30",
  Glutes: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/30",
};

function FocusBadge({ focus }: { focus: string }) {
  const color = FOCUS_COLORS[focus] || FOCUS_COLORS.Rest;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold",
        color,
      )}
    >
      {focus}
    </span>
  );
}

function DayCard({ day }: { day: DayWorkout }) {
  const [expanded, setExpanded] = useState(false);

  if (day.isRest) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-20">
              {day.day}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Moon size={12} />
              Recovery
            </span>
          </div>
          <Moon size={16} className="text-muted-foreground/20" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        expanded
          ? "border-primary/20 bg-card shadow-lg"
          : "border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/60",
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-20">
            {day.day}
          </span>
          <FocusBadge focus={day.focus} />
          {day.workout && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground/60">
              <Clock size={12} className="text-primary/60" />
              {day.workout.totalTime}m
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground/40 transition-transform duration-300",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && day.workout && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/20 px-5 py-5 space-y-6">
              {day.workout.sections.map((section, si) => (
                <div key={si} className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    {section.name}
                  </h4>

                  <div className="space-y-2">
                    {section.exercises.map((ex, ei) => (
                      <div
                        key={ei}
                        className="group flex items-start justify-between gap-3 rounded-lg border border-border/30 bg-background/40 px-4 py-3 transition-all hover:border-primary/20 hover:bg-background/60"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                            {ei + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {ex.name}
                            </p>
                            {ex.instructions && (
                              <p className="mt-0.5 text-xs text-muted-foreground/70 leading-relaxed">
                                {ex.instructions}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {ex.sets && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                                <Repeat size={10} className="opacity-70" />
                                {ex.sets}
                              </span>
                            )}
                            {ex.reps && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                <Dumbbell size={10} className="opacity-70" />
                                {ex.reps}
                              </span>
                            )}
                            {ex.duration && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                <Timer size={10} className="opacity-70" />
                                {ex.duration}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground/50">
                            Rest {ex.rest}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WeeklyPlanDisplay({ plan, onRegenerate }: Props) {
  const activeDays = plan.days.filter((d) => !d.isRest).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 w-full"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
          <Zap size={13} className="fill-primary/30" />
          <span>{activeDays} Training Days</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground/70">{plan.goal}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {plan.weekTitle}
        </h2>
        <div className="flex justify-center pt-1">
          <PlanActions
            onRegenerate={onRegenerate}
            exportData={{ type: "weekly", plan }}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {plan.days.map((d) => {
          const isActive = !d.isRest;
          return (
            <div
              key={d.day}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg py-3 transition-all",
                isActive
                  ? "bg-card/50 border border-border/40 shadow-sm"
                  : "opacity-30",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                {d.day.slice(0, 3)}
              </span>
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
              {isActive && (
                <span className="text-[10px] font-medium text-muted-foreground/70 leading-tight text-center px-0.5">
                  {d.focus.length > 6 ? d.focus.split(" ")[0] : d.focus}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {plan.days.map((d) => (
          <DayCard key={d.day} day={d} />
        ))}
      </div>
    </motion.div>
  );
}
