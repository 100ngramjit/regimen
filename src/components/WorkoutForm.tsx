"use client";

import React from "react";
import { FitnessLevel, WorkoutRequest } from "@/lib/schemas";
import {
  Sparkles,
  Dumbbell,
  Clock,
  Activity,
  Wand2,
  MessageSquareText,
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

export default function WorkoutForm({ onGenerate, isLoading }: Props) {
  const [formData, setFormData] = useDbState<WorkoutRequest>(
    "ff-single-form",
    DEFAULT,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guard duration bounds
    const safe = {
      ...formData,
      duration: Math.min(120, Math.max(5, formData.duration ?? 30)),
    };
    onGenerate(safe);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Goal
              </Label>
              <Select
                value={formData.goal}
                onValueChange={(v) => setFormData({ ...formData, goal: v })}
              >
                <SelectTrigger className="bg-muted/50 border-border/40 h-12 text-base">
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

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Duration
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  min={5}
                  max={120}
                  className="bg-muted/50 border-border/40 pr-12 h-12 text-base"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-muted-foreground uppercase">
                  min
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                <Dumbbell size={14} className="text-primary" /> Equipment
              </Label>
              <Select
                value={formData.equipment}
                onValueChange={(v) =>
                  setFormData({ ...formData, equipment: v })
                }
              >
                <SelectTrigger className="bg-muted/50 border-border/40 h-12 text-base">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Equipment</SelectItem>
                  <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
                  <SelectItem value="full gym">Full Gym Access</SelectItem>
                  <SelectItem value="kettlebell">Kettlebells</SelectItem>
                  <SelectItem value="resistance bands">
                    Resistance Bands
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Level
              </Label>
              <Select
                value={formData.level}
                onValueChange={(v) =>
                  setFormData({ ...formData, level: v as FitnessLevel })
                }
              >
                <SelectTrigger className="bg-muted/50 border-border/40 h-12 text-base">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
              <MessageSquareText size={14} className="text-primary" />{" "}
              Customization
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. knee friendly, focus on posterior chain..."
              className="bg-muted/50 border-border/40 min-h-[120px] resize-none focus:bg-background transition-colors text-base p-4"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full h-16 text-base font-bold tracking-[0.2em] uppercase transition-all shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Forging...
            </div>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Get Workout
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
