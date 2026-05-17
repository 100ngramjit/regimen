"use client";

import React from "react";
import { Workout } from "@/lib/schemas";
import {
  Clock,
  CheckCircle2,
  Dumbbell,
  Timer,
  Repeat,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PlanActions from "@/components/PlanActions";
import ExportMenu from "@/components/ExportMenu";

interface Props {
  workout: Workout;
  onRegenerate: () => void;
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
    <div className="group relative rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 sm:p-5 transition-all hover:border-primary/20 hover:bg-card/60 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)] max-w-full">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary border border-primary/20">
            {number}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-semibold text-foreground break-words">
              {name}
            </h4>
            {instructions && (
              <p className="mt-1 text-sm text-muted-foreground/80 leading-relaxed break-words">
                {instructions}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 w-full sm:w-auto">
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
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary border border-primary/20">
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
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 sm:space-y-10 w-full max-w-full overflow-hidden"
    >
      <div className="text-center space-y-3 px-2 sm:px-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 text-xs font-semibold text-primary shadow-[0_4px_16px_-4px_rgba(172,189,186,0.15)] max-w-full">
          <Clock size={13} className="shrink-0" />
          <span className="truncate">{workout.totalTime} Minutes</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground break-words px-1">
          {workout.title}
        </h2>

        <div className="flex items-center justify-center gap-2 pt-2">
          <PlanActions onRegenerate={onRegenerate} />
          <ExportMenu plan={{ type: "single", workout }} />
        </div>
      </div>

      <div className="space-y-8 sm:space-y-12 max-w-full">
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
