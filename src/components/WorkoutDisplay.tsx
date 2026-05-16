"use client";

import React from "react";
import { Workout } from "@/lib/schemas";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Timer,
  Repeat,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PlanActions from "@/components/PlanActions";

interface Props {
  workout: Workout;
  onRegenerate: () => void;
  onAdjust: (type: "harder" | "easier") => void;
}

function ExerciseCard({
  number,
  name,
  sets,
  reps,
  duration,
  rest,
  instructions,
}: {
  number: number;
  name: string;
  sets?: string | null;
  reps?: string | null;
  duration?: string | null;
  rest: string;
  instructions?: string | null;
}) {
  return (
    <div className="group relative rounded-xl border border-border/50 bg-card/30 p-5 transition-all hover:border-primary/20 hover:bg-card/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary border border-primary/20">
            {number}
          </span>
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-foreground truncate">
              {name}
            </h4>
            {instructions && (
              <p className="mt-1 text-sm text-muted-foreground/80 leading-relaxed">
                {instructions}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {sets && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-foreground/10 px-2.5 py-1 text-[11px] font-semibold text-foreground border border-foreground/10">
                <Repeat size={12} className="opacity-70" />
                {sets}
              </span>
            )}
            {reps && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary border border-primary/20">
                <Dumbbell size={12} className="opacity-70" />
                {reps}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Timer size={12} className="opacity-70" />
                {duration}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70">
            <Clock size={11} className="text-primary/60" />
            Rest {rest}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutDisplay({
  workout,
  onRegenerate,
  onAdjust,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
          <Clock size={13} />
          {workout.totalTime} Minutes
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {workout.title}
        </h2>

        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex items-center rounded-lg border border-border/40 bg-muted/20 p-0.5">
            <button
              onClick={() => onAdjust("easier")}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <TrendingDown size={13} />
              Easier
            </button>
            <div className="h-4 w-px bg-border/40 mx-0.5" />
            <button
              onClick={() => onAdjust("harder")}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <TrendingUp size={13} />
              Harder
            </button>
          </div>
          <PlanActions
            onRegenerate={onRegenerate}
            exportData={{ type: "single", workout }}
          />
        </div>
      </div>

      <div className="space-y-12">
        {workout.sections.map((section, si) => (
          <div key={si} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/30" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 px-3">
                {section.name}
              </h3>
              <div className="h-px flex-1 bg-border/30" />
            </div>

            <div className="space-y-2.5">
              {section.exercises.map((ex, ei) => (
                <ExerciseCard
                  key={ei}
                  number={ei + 1}
                  name={ex.name}
                  sets={ex.sets}
                  reps={ex.reps}
                  duration={ex.duration}
                  rest={ex.rest}
                  instructions={ex.instructions}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full h-13 rounded-xl text-sm font-semibold tracking-tight shadow-lg bg-primary hover:opacity-90 transition-all">
        <CheckCircle2 size={18} className="mr-2" />
        Complete & Log Workout
      </Button>
    </motion.div>
  );
}
