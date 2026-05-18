"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CalendarDays,
  Zap,
  Dumbbell,
  Timer,
  Repeat,
  Moon,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Workout, WeeklyPlan, DayWorkout } from "@/lib/schemas";
import ExportMenu from "@/components/ExportMenu";
import { BorderBeam } from "@/components/ui/border-beam";
import ExerciseInstructions from "@/components/ExerciseInstructions";
import {
  ExpandableScreen,
  ExpandableScreenTrigger,
  ExpandableScreenContent,
} from "@/components/ui/expandable-screen";

type WorkoutEntry = {
  id: string;
  type: "session" | "weekly";
  title: string;
  content: Workout | WeeklyPlan;
  createdAt: string;
};

function focusBadgeClasses(focus: string) {
  if (focus === "Rest")
    return "bg-muted text-muted-foreground border-border/40";
  return "bg-primary/10 text-primary border-primary/20";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

function getContentSummary(entry: WorkoutEntry): string {
  if (entry.type === "session") {
    const w = entry.content as Workout;
    const totalEx = w.sections.reduce((a, s) => a + s.exercises.length, 0);
    return `${w.sections.length} sections \u00b7 ${totalEx} exercises \u00b7 ${w.totalTime} min`;
  }
  const p = entry.content as WeeklyPlan;
  const active = p.days.filter((d) => !d.isRest).length;
  return `${active}/${p.days.length} training days \u00b7 ${p.goal}`;
}

function sessionExerciseCount(w: Workout): number {
  return w.sections.reduce((a, s) => a + s.exercises.length, 0);
}

// Detail views rendered inside the expanded screen

function SessionDetail({ workout }: { workout: Workout }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Zap size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {workout.title}
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
            <Clock size={14} className="text-primary/60" />
            {workout.totalTime} minutes
          </div>
        </div>
      </div>

      {workout.sections.map((section, si) => (
        <div key={si} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/20" />
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2">
              {section.name}
            </h3>
            <div className="h-px flex-1 bg-border/20" />
          </div>

          <div className="space-y-2">
            {section.exercises.map((ex, ei) => (
              <div
                key={ei}
                className="flex items-start justify-between gap-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 transition-all hover:border-primary/20 hover:bg-card/60"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary border border-primary/20">
                    {ei + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {ex.name}
                    </p>
                    {ex.instructions && (
                      <ExerciseInstructions instructions={ex.instructions} />
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

function WeeklyDetail({ plan }: { plan: WeeklyPlan }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedDay = plan.days[selectedDayIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <CalendarDays size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {plan.weekTitle}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{plan.goal}</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1.5 pb-2 -mx-2 px-2 scrollbar-hide">
        {plan.days.map((d, idx) => {
          const isActive = !d.isRest;
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDayIndex(idx)}
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

      <div className="space-y-3">
        {selectedDay.isRest ? (
          <div className="rounded-xl border border-dashed border-border/30 bg-card/30 backdrop-blur-sm px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                {selectedDay.day}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Moon size={11} />
                Recovery
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground/70">
              Take time to rest and recover. Light stretching, walking, or yoga
              is encouraged.
            </p>
          </div>
        ) : selectedDay.workout ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                {selectedDay.day}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold",
                  focusBadgeClasses(selectedDay.focus),
                )}
              >
                {selectedDay.focus}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                <Clock size={11} className="text-primary/60" />
                {selectedDay.workout.totalTime}m
              </span>
            </div>

            {selectedDay.workout.sections.map((section, si) => (
              <div key={si} className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  {section.name}
                </h4>
                <div className="space-y-1.5">
                  {section.exercises.map((ex, ei) => (
                    <div
                      key={ei}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/30 bg-card/40 backdrop-blur-sm px-4 py-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                          {ei + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {ex.name}
                          </p>
                          {ex.instructions && (
                            <ExerciseInstructions instructions={ex.instructions} />
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
        ) : null}
      </div>
    </div>
  );
}

function WorkoutCard({ entry }: { entry: WorkoutEntry }) {
  const layoutId = `workout-${entry.id}`;

  return (
    <ExpandableScreen
      layoutId={layoutId}
      triggerRadius="16px"
      contentRadius="20px"
    >
      <ExpandableScreenTrigger
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-200 glass-light",
          "hover:bg-card/60 hover:border-primary/30 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)]",
          "hover:border-primary/30",
        )}
      >
        <BorderBeam
          size={80}
          duration={8}
          borderWidth={1.5}
          colorFrom="#172069ff"
          colorTo="#bdbdbdff"
        />
        <div className="p-5 space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border">
            {entry.type === "session" ? (
              <Zap size={18} />
            ) : (
              <CalendarDays size={18} />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground leading-tight line-clamp-2">
              {entry.title}
            </h3>
            <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">
              {getContentSummary(entry)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border">
              {entry.type === "session" ? (
                <Zap size={9} />
              ) : (
                <CalendarDays size={9} />
              )}
              {entry.type === "session" ? "Session" : "Weekly"}
            </span>
            <span className="text-[10px] text-muted-foreground/40">
              {formatDateRelative(entry.createdAt)}
            </span>
          </div>
        </div>
      </ExpandableScreenTrigger>

      <ExpandableScreenContent className="bg-card/80 backdrop-blur-2xl border border-border/50 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)]">
        <div className="p-6 sm:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {entry.type === "session" ? (
              <SessionDetail workout={entry.content as Workout} />
            ) : (
              <WeeklyDetail plan={entry.content as WeeklyPlan} />
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border/10">
              <ExportMenu
                plan={
                  entry.type === "session"
                    ? { type: "single", workout: entry.content as Workout }
                    : { type: "weekly", plan: entry.content as WeeklyPlan }
                }
              />
            </div>
          </div>
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
}

export default function HistoryClient() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workouts")
      .then((r) => r.json())
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-muted/20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl bg-muted/10 border border-border/20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <History size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Workout History
            </h1>
            <p className="text-sm text-muted-foreground">
              {workouts.length === 0
                ? "No workouts generated yet"
                : `${workouts.length} workout${workouts.length === 1 ? "" : "s"} on record`}
            </p>
          </div>
        </div>
      </div>

      {workouts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl glass-light mb-4">
            <Dumbbell size={28} className="text-muted-foreground/40" />
          </div>
          <p className="text-base font-medium text-muted-foreground mb-1">
            No workouts yet
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-xs">
            Generate your first workout on the{" "}
            <a
              href="/session"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Session
            </a>{" "}
            or{" "}
            <a
              href="/weekly"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Weekly
            </a>{" "}
            page.
          </p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workouts.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <WorkoutCard entry={entry} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
