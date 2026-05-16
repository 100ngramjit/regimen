"use client";

import React from "react";
import { FitnessLevel, WorkoutRequest } from "@/lib/schemas";
import {
  Dumbbell,
  Clock,
  Target,
  MessageSquareText,
  Zap,
  ArrowRight,
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
import { cn } from "@/lib/utils";
import { useDbState } from "@/lib/use-db-state";

interface Props {
  onGenerate: (data: WorkoutRequest) => void;
  isLoading: boolean;
}

const DEFAULT: WorkoutRequest = {
  goal: "muscle gain",
  duration: 30,
  equipment: "full gym",
  level: "intermediate",
  notes: "",
};

const LEVELS: { value: FitnessLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function WorkoutForm({ onGenerate, isLoading }: Props) {
  const [formData, setFormData] = useDbState<WorkoutRequest>(
    "regimen:form:workout:data",
    DEFAULT,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safe = {
      ...formData,
      duration: Math.min(120, Math.max(5, formData.duration ?? 30)),
    };
    onGenerate(safe);
  };

  const update = <K extends keyof WorkoutRequest>(
    key: K,
    value: WorkoutRequest[K],
  ) => setFormData({ ...formData, [key]: value });

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Target size={13} className="text-primary" /> Goal
          </Label>
          <Select
            value={formData.goal}
            onValueChange={(v) => v && update("goal", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fat loss">Fat Loss</SelectItem>
              <SelectItem value="muscle gain">Muscle Gain</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Dumbbell size={13} className="text-primary" /> Equipment
          </Label>
          <Select
            value={formData.equipment}
            onValueChange={(v) => v && update("equipment", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Equipment</SelectItem>
              <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
              <SelectItem value="full gym">Full Gym Access</SelectItem>
              <SelectItem value="kettlebell">Kettlebells</SelectItem>
              <SelectItem value="resistance bands">Resistance Bands</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Clock size={13} className="text-primary" /> Duration
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={formData.duration}
            onChange={(e) => update("duration", parseInt(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex items-center gap-1 min-w-[72px] justify-end">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {formData.duration}
            </span>
            <span className="text-xs font-medium text-muted-foreground">min</span>
          </div>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground/60 px-0.5">
          <span>5</span>
          <span>120</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Zap size={13} className="text-primary" /> Level
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("level", value)}
              className={cn(
                "relative rounded-xl border px-3 py-3 text-center text-sm font-medium transition-all",
                formData.level === value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <MessageSquareText size={13} className="text-primary" /> Notes
        </Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="e.g. knee friendly, focus on posterior chain..."
          className="min-h-[100px] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        size="lg"
        className="w-full h-14 text-base font-semibold tracking-tight transition-all shadow-lg shadow-primary/15"
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <span className="h-5 w-5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Generate Workout
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </Button>
    </form>
  );
}
