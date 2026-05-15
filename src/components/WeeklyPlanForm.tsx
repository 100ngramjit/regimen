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
  Wand2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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

export default function WeeklyPlanForm({ onGenerate, isLoading }: Props) {
  const [goal, setGoal] = useDbState("ff-week-goal", "muscle gain");
  const [level, setLevel] = useDbState<FitnessLevel>(
    "ff-week-level",
    "intermediate",
  );
  const [equipment, setEquipment] = useDbState("ff-week-equipment", "full gym");
  const [notes, setNotes] = useDbState("ff-week-notes", "");
  const [schedule, setSchedule] = useDbState<DayPlanConfig[]>(
    "ff-week-schedule",
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ── Stats Overview ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              value: daysPerWeek,
              label: "Workouts",
              icon: Flame,
              color: "text-primary",
            },
            {
              value: 7 - daysPerWeek,
              label: "Rest Days",
              icon: Clock,
              color: "text-muted-foreground",
            },
            {
              value: `${Math.round(totalMins / Math.max(daysPerWeek, 1))}m`,
              label: "Avg Session",
              icon: Zap,
              color: "text-primary",
            },
            {
              value: `${totalMins}m`,
              label: "Weekly Total",
              icon: Target,
              color: "text-primary",
            },
          ].map((s, i) => (
            <Card key={i} className="bg-muted/30 border-border/40 shadow-none">
              <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                <s.icon size={16} className={cn("mb-2 opacity-70", s.color)} />
                <span className="text-xl sm:text-2xl font-black">
                  {s.value}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="bg-border/40" />

        {/* ── Weekly Schedule ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Weekly Split
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3">
            {schedule.map((d) => (
              <div
                key={d.day}
                className={cn(
                  "flex flex-col items-center gap-3 sm:gap-4 rounded-xl border p-2 sm:p-3 transition-all duration-200",
                  d.isRest
                    ? "bg-muted/20 border-border/40 opacity-50"
                    : "bg-muted/50 border-primary/20 ring-1 ring-primary/10",
                )}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {d.day.slice(0, 3)}
                </span>

                <button
                  type="button"
                  onClick={() => toggleRest(d.day as DayOfWeek)}
                  className={cn(
                    "w-full rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
                    d.isRest
                      ? "bg-muted text-muted-foreground hover:bg-muted/80"
                      : "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
                  )}
                >
                  {d.isRest ? "OFF" : "ON"}
                </button>

                {!d.isRest ? (
                  <div className="w-full space-y-4">
                    <Select
                      value={d.focus}
                      onValueChange={(v) =>
                        setFocus(d.day as DayOfWeek, v as DayFocus)
                      }
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-[10px] sm:text-xs font-bold uppercase px-1.5 sm:px-2 border border-primary/20 bg-background/80 text-primary hover:bg-background transition-all">
                        <SelectValue placeholder={d.focus} />
                      </SelectTrigger>
                      <SelectContent>
                        {DAY_FOCUS_OPTIONS.filter((f) => f !== "Rest").map(
                          (f) => (
                            <SelectItem
                              key={f}
                              value={f}
                              className="text-[10px] sm:text-xs font-bold uppercase"
                            >
                              {f}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center justify-between w-full px-1">
                      <button
                        type="button"
                        onClick={() => setDuration(d.day as DayOfWeek, -15)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[11px] font-bold">
                        {d.duration}m
                      </span>
                      <button
                        type="button"
                        onClick={() => setDuration(d.day as DayOfWeek, 15)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground/20 uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
                      REST
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* ── Global Preferences ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
              <Flame size={16} className="text-primary" /> Goal
            </Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="bg-muted/50 border-border/40 h-12 text-base">
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

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
              <Zap size={16} className="text-primary" /> Level
            </Label>
            <Select
              value={level}
              onValueChange={(v: FitnessLevel) => setLevel(v)}
            >
              <SelectTrigger className="bg-muted/50 border-border/40 h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
              <Dumbbell size={16} className="text-primary" /> Equipment
            </Label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger className="bg-muted/50 border-border/40 h-12 text-base">
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

          <div className="md:col-span-3 space-y-3">
            <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
              <MessageSquareText size={16} className="text-primary" />{" "}
              Customization
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requests for the AI..."
              className="bg-muted/50 border-border/40 min-h-[120px] resize-none focus:bg-background transition-colors text-base p-4"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || daysPerWeek === 0}
          className="w-full h-14 rounded-2xl text-base font-black tracking-widest uppercase transition-all shadow-xl hover:shadow-primary/20 active:scale-[0.98] group"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 text-background">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Forging...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Wand2 className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              <span>Make {daysPerWeek}-Day Plan</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
