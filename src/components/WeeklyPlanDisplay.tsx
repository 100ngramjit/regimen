"use client";

import React, { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/schemas";
import { Clock, Moon, Zap, Dumbbell, Timer, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import PlanActions from "@/components/PlanActions";
import ExportMenu from "@/components/ExportMenu";
import {
  ExpandableScreen,
  ExpandableScreenTrigger,
  ExpandableScreenContent,
} from "@/components/ui/expandable-screen";

interface Props {
  plan: WeeklyPlan;
  onRegenerate: () => void;
}

function FocusBadge({ focus }: { focus: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 sm:px-3 py-0.5 text-[11px] font-semibold max-w-[120px] truncate",
        focus === "Rest"
          ? "bg-muted text-muted-foreground border-border/40"
          : "bg-primary/10 text-primary border-primary/20",
      )}
    >
      {focus}
    </span>
  );
}

function ExerciseList({ day }: { day: DayWorkout }) {
  if (!day.workout) return null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {day.workout.sections.map((section, si) => (
        <div key={si} className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {section.name}
          </h4>

          <div className="space-y-2">
            {section.exercises.map((ex, ei) => (
              <div
                key={ei}
                className="group flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm px-3 sm:px-4 py-3 transition-all hover:border-primary/20 hover:bg-card/60 max-w-full"
              >
                <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                    {ei + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground break-words">
                      {ex.name}
                    </p>
                    {ex.instructions && (
                      <p className="mt-0.5 text-xs text-muted-foreground/70 leading-relaxed break-words">
                        {ex.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
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
  );
}

export default function WeeklyPlanDisplay({ plan, onRegenerate }: Props) {
  const activeDays = plan.days.filter((d) => !d.isRest).length;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleExpandChange = (idx: number, expanded: boolean) => {
    setExpandedIndex(expanded ? idx : null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden"
    >
      <div className="text-center space-y-3 px-2 sm:px-0">
        <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 text-xs font-semibold text-primary shadow-[0_4px_16px_-4px_rgba(172,189,186,0.15)] max-w-full">
          <Zap size={13} className="fill-primary/30 shrink-0" />
          <span className="truncate">{activeDays} Training Days</span>
          <span className="text-muted-foreground/50 shrink-0">·</span>
          <span className="text-muted-foreground/70 truncate">{plan.goal}</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground break-words px-1">
          {plan.weekTitle}
        </h2>
        <div className="flex items-center justify-center gap-2 pt-1">
          <PlanActions onRegenerate={onRegenerate} />
          <ExportMenu plan={{ type: "weekly", plan }} />
        </div>
      </div>

      <div className="flex justify-start sm:justify-center overflow-x-auto gap-1.5 pb-2 -mx-2 px-2 scrollbar-hide sm:px-0 sm:mx-0 max-w-full">
        {plan.days.map((d, idx) => {
          const isActive = !d.isRest;
          const isExpanded = expandedIndex === idx;
          return (
            <ExpandableScreen
              key={d.day}
              layoutId={`day-${d.day}`}
              triggerRadius="8px"
              contentRadius="20px"
              expanded={isExpanded}
              onExpandChange={(expanded) => handleExpandChange(idx, expanded)}
            >
              <ExpandableScreenTrigger>
                <button
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg py-3 min-w-[3.5rem] transition-all backdrop-blur-sm",
                    isExpanded
                      ? "bg-card/80 border border-primary shadow-sm"
                      : isActive
                        ? "bg-card/60 border border-primary/50"
                        : "opacity-40 bg-card/30 border border-border/30",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {d.day.slice(0, 3)}
                  </span>
                  {isActive ? (
                    <span className="text-[10px] font-medium text-muted-foreground/70 leading-tight text-center px-0.5">
                      {d.focus.length > 6 ? d.focus.split(" ")[0] : d.focus}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground/70 leading-tight text-center px-0.5">
                      Rest
                    </span>
                  )}
                </button>
              </ExpandableScreenTrigger>
              <ExpandableScreenContent>
                <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 max-w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {d.day}
                    </span>
                    {d.isRest ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-0.5 text-xs font-medium text-muted-foreground">
                        <Moon size={14} />
                        Recovery Day
                      </span>
                    ) : (
                      <>
                        <FocusBadge focus={d.focus} />
                        {d.workout && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                            <Clock size={12} className="text-primary/60" />
                            {d.workout.totalTime}m
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {d.isRest ? (
                    <p className="text-muted-foreground/70 leading-relaxed break-words">
                      Take time to rest and recover. Light stretching, walking,
                      or yoga is encouraged.
                    </p>
                  ) : (
                    <ExerciseList day={d} />
                  )}
                </div>
              </ExpandableScreenContent>
            </ExpandableScreen>
          );
        })}
      </div>
    </motion.div>
  );
}
