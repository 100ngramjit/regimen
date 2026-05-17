"use client";

import React, { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/schemas";
import {
  Clock,
  Moon,
  Zap,
  Dumbbell,
  Timer,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PlanActions from "@/components/PlanActions";
import ExportMenu from "@/components/ExportMenu";
import {
  ExpandableScreen,
  ExpandableScreenTrigger,
  ExpandableScreenContent,
} from "@/components/ui/expandable-screen";
import { BorderBeam } from "@/components/ui/border-beam";

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

function DayCard({ day, layoutId }: { day: DayWorkout; layoutId: string }) {
  if (day.isRest) {
    return (
      <ExpandableScreen
        layoutId={layoutId}
        triggerRadius="16px"
        contentRadius="20px"
      >
        <ExpandableScreenTrigger>
          <div className="rounded-xl border border-dashed border-border/40 bg-card/30 backdrop-blur-sm px-4 sm:px-5 py-4 glass-hover max-w-full">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-16 sm:w-20 shrink-0 truncate">
                {day.day}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2 sm:px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Moon size={12} className="shrink-0" />
                Recovery
              </span>
            </div>
          </div>
        </ExpandableScreenTrigger>
        <ExpandableScreenContent>
          <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 max-w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
                {day.day}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-0.5 text-xs font-medium text-muted-foreground">
                <Moon size={14} />
                Recovery Day
              </span>
            </div>
            <p className="text-muted-foreground/70 leading-relaxed break-words">
              Take time to rest and recover. Light stretching, walking, or yoga
              is encouraged.
            </p>
          </div>
        </ExpandableScreenContent>
      </ExpandableScreen>
    );
  }

  return (
    <ExpandableScreen
      layoutId={layoutId}
      triggerRadius="16px"
      contentRadius="20px"
    >
      <ExpandableScreenTrigger>
        <div className="rounded-xl border glass-hover px-4 sm:px-5 py-4 cursor-pointer max-w-full relative overflow-hidden">
          <BorderBeam
            size={80}
            duration={8}
            colorFrom="var(--primary)"
            colorTo="transparent"
            borderWidth={1.5}
          />
          <div className="flex items-center justify-between gap-2 relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-16 sm:w-20 shrink-0 truncate">
              {day.day}
            </span>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <FocusBadge focus={day.focus} />
              {day.workout && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground/60 shrink-0">
                  <Clock size={12} className="text-primary/60" />
                  {day.workout.totalTime}m
                </span>
              )}
            </div>
          </div>
        </div>
      </ExpandableScreenTrigger>
      <ExpandableScreenContent>
        <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 max-w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
              {day.day}
            </span>
            <FocusBadge focus={day.focus} />
            {day.workout && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                <Clock size={12} className="text-primary/60" />
                {day.workout.totalTime}m
              </span>
            )}
          </div>
          <ExerciseList day={day} />
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
}

export default function WeeklyPlanDisplay({ plan, onRegenerate }: Props) {
  const activeDays = plan.days.filter((d) => !d.isRest).length;
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

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

      <div className="flex overflow-x-auto gap-1.5 pb-2 -mx-2 px-2 scrollbar-hide sm:px-0 sm:mx-0 max-w-full">
        {plan.days.map((d, idx) => {
          const isActive = !d.isRest;
          const isSelected = idx === selectedTabIndex;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedTabIndex(idx)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-3 min-w-[3.5rem] transition-all backdrop-blur-sm",
                isSelected
                  ? "bg-card/80 border border-primary shadow-sm"
                  : isActive
                    ? "bg-card/60 border border-border/50"
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
          );
        })}
      </div>

      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTabIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <DayCard
              key={plan.days[selectedTabIndex].day}
              day={plan.days[selectedTabIndex]}
              layoutId={`day-${plan.days[selectedTabIndex].day}`}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
