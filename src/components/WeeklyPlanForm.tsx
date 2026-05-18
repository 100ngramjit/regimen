"use client";

import React from "react";
import {
  DAY_FOCUS_OPTIONS,
  DayPlanConfig,
  DayOfWeek,
  DayFocus,
  WeeklyPlanRequest,
  FitnessLevel,
} from "@/lib/schemas";
import {
  Calendar,
  Dumbbell,
  Flame,
  Target,
  Zap,
  Clock,
  Minus,
  Plus,
  MessageSquareText,
  Gauge,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDbState } from "@/lib/use-db-state";

interface Props {
  onGenerate: (data: WeeklyPlanRequest) => void;
  isLoading: boolean;
}

const DEFAULT_SCHEDULE: DayPlanConfig[] = [
  { day: "Sunday", focus: "Rest", isRest: true, duration: 60 },
  { day: "Monday", focus: "Push", isRest: false, duration: 60 },
  { day: "Tuesday", focus: "Pull", isRest: false, duration: 60 },
  { day: "Wednesday", focus: "Legs", isRest: false, duration: 60 },
  { day: "Thursday", focus: "Rest", isRest: true, duration: 60 },
  { day: "Friday", focus: "Full Body", isRest: false, duration: 60 },
  { day: "Saturday", focus: "Cardio", isRest: false, duration: 45 },
];

const LEVELS: { value: FitnessLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];



export default function WeeklyPlanForm({ onGenerate, isLoading }: Props) {
  const [goal, setGoal] = useDbState("regimen:form:weekly:goal", "muscle gain");
  const [level, setLevel] = useDbState<FitnessLevel>(
    "regimen:form:weekly:level",
    "intermediate",
  );
  const [equipment, setEquipment] = useDbState("regimen:form:weekly:equipment", "full gym");
  const [notes, setNotes] = useDbState("regimen:form:weekly:notes", "");
  const [schedule, setSchedule] = useDbState<DayPlanConfig[]>(
    "regimen:form:weekly:schedule",
    DEFAULT_SCHEDULE,
  );

  const activeDays = schedule.filter((d) => !d.isRest);
  const daysPerWeek = activeDays.length;
  const totalMins = activeDays.reduce((s, d) => s + d.duration, 0);

  const toggleRest = (day: DayOfWeek) => {
    setSchedule(
      schedule.map((d) => {
        if (d.day !== day) return d;
        const isNowRest = !d.isRest;
        return { ...d, isRest: isNowRest, focus: isNowRest ? "Rest" : "Push" };
      }),
    );
  };

  const setFocus = (day: DayOfWeek, focus: DayFocus) => {
    setSchedule(
      schedule.map((d) =>
        d.day === day ? { ...d, focus, isRest: focus === "Rest" } : d,
      ),
    );
  };

  const setDuration = (day: DayOfWeek, delta: number) => {
    setSchedule(
      schedule.map((d) => {
        if (d.day !== day) return d;
        const next = Math.min(180, Math.max(15, d.duration + delta));
        return { ...d, duration: next };
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      daysPerWeek,
      goal,
      level,
      equipment,
      sessionDuration: Math.round(totalMins / Math.max(daysPerWeek, 1)),
      schedule,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { value: daysPerWeek, label: "Training Days", icon: Flame },
          { value: 7 - daysPerWeek, label: "Rest Days", icon: Clock },
          { value: `${Math.round(totalMins / Math.max(daysPerWeek, 1))}m`, label: "Avg Session", icon: Zap },
          { value: `${totalMins}m`, label: "Weekly Total", icon: Target },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-2xl glass px-3 py-4 text-center"
          >
            <s.icon size={15} className="mx-auto mb-1.5 text-primary/70" />
            <div className="text-xl font-bold tabular-nums text-foreground">{s.value}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Calendar size={14} className="text-primary" />
          Weekly Schedule
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {schedule.map((d) => {
            return (
              <div
                key={d.day}
                className={cn(
                  "rounded-2xl glass-light p-3 transition-all duration-200",
                  d.isRest ? "border-dashed" : "",
                )}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 text-center">
                  {d.day.slice(0, 3)}
                </div>

                <button
                  type="button"
                  onClick={() => toggleRest(d.day as DayOfWeek)}
                  className={cn(
                    "w-full rounded-lg py-1.5 text-[11px] font-semibold transition-all cursor-pointer mb-2",
                    d.isRest
                      ? "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
                      : "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
                  )}
                >
                  {d.isRest ? "Rest" : "Train"}
                </button>

                {!d.isRest ? (
                  <div className="space-y-2">
                    <Select
                      value={d.focus}
                      onValueChange={(v) => v && setFocus(d.day as DayOfWeek, v as DayFocus)}
                    >
                      <SelectTrigger className="h-7 text-[10px] font-semibold uppercase px-1.5 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAY_FOCUS_OPTIONS.filter((f) => f !== "Rest").map((f) => (
                          <SelectItem key={f} value={f} className="text-xs font-medium">
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center justify-between gap-0.5">
                      <button
                        type="button"
                        onClick={() => setDuration(d.day as DayOfWeek, -15)}
                        className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-semibold tabular-nums">{d.duration}</span>
                      <button
                        type="button"
                        onClick={() => setDuration(d.day as DayOfWeek, 15)}
                        className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[60px]">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/30">
                      —
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Flame size={13} className="text-primary" /> Goal
          </Label>
          <Select value={goal} onValueChange={(v) => v && setGoal(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fat loss">Fat Loss</SelectItem>
              <SelectItem value="muscle gain">Muscle Gain</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="endurance">Endurance</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Dumbbell size={13} className="text-primary" /> Equipment
          </Label>
          <Select value={equipment} onValueChange={(v) => v && setEquipment(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Equipment</SelectItem>
              <SelectItem value="dumbbells">Dumbbells</SelectItem>
              <SelectItem value="full gym">Full Gym</SelectItem>
              <SelectItem value="kettlebell">Kettlebell</SelectItem>
              <SelectItem value="resistance bands">Bands</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Activity size={13} className="text-primary" /> Level
          </Label>
          <Select value={level} onValueChange={(v) => v && setLevel(v as FitnessLevel)}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <MessageSquareText size={13} className="text-primary" /> Notes
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific requests for the AI..."
          className="min-h-[90px] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || daysPerWeek === 0}
        size="lg"
        className="w-full h-14 text-base font-semibold tracking-tight transition-all shadow-lg shadow-primary/15"
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <span className="h-5 w-5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
            Generating Plan...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Generate {daysPerWeek}-Day Plan
            <ArrowRight size={18} />
          </span>
        )}
      </Button>
    </form>
  );
}
