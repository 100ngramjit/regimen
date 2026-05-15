"use client";

import React, { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/schemas";
import {
  Clock,
  ChevronDown,
  Moon,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import PlanActions from "@/components/PlanActions";

interface Props {
  plan: WeeklyPlan;
  onRegenerate: () => void;
  onExportMd: () => void;
  onExportTxt: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onShare: () => void;
}

const DAY_STYLE = {
  rest: {
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    border: "border-border/30",
    accent: "text-muted-foreground",
    bg: "bg-muted/5",
  },
  active: {
    text: "text-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
    border: "border-primary/20",
    accent: "text-primary",
    bg: "bg-primary/5",
  },
} as const;

type StyleEntry = (typeof DAY_STYLE)["active"] | (typeof DAY_STYLE)["rest"];

function getDayStyle(isRest: boolean): StyleEntry {
  return isRest ? DAY_STYLE.rest : DAY_STYLE.active;
}

function DayCard({ day }: { day: DayWorkout }) {
  const [expanded, setExpanded] = useState(false);
  const style = getDayStyle(day.isRest);

  if (day.isRest) {
    return (
      <Card className="border-border/30 bg-muted/10 backdrop-blur-sm transition-all hover:bg-muted/20 opacity-80">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <span className="w-20 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              {day.day}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 bg-background/50">
              <Moon size={14} className="text-muted-foreground/60" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Neural Recovery
              </span>
            </div>
          </div>
          <Moon size={20} className="text-muted-foreground/20 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-500",
        expanded
          ? "border-primary/30 ring-1 ring-primary/10 shadow-2xl scale-[1.01]"
          : "border-border/30 bg-card/40 hover:bg-card/60 backdrop-blur-sm",
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-6 text-left group"
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <span className="w-20 text-xs font-black uppercase tracking-widest text-foreground/80 group-hover:text-foreground transition-colors">
            {day.day}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.15em] border shadow-sm",
                style.badge,
              )}
            >
              {day.focus}
            </span>
            {day.workout && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/70">
                <Clock size={14} className="text-primary" />{" "}
                {day.workout.totalTime}m
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "transition-transform duration-500 flex items-center justify-center h-8 w-8 rounded-full border border-border/40 group-hover:bg-muted/20",
            style.accent,
            expanded ? "rotate-180" : "",
          )}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      <AnimatePresence>
        {expanded && day.workout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="border-t border-border/10 bg-muted/10 p-4 sm:p-8 space-y-12">
              {day.workout.sections.map((section, si) => (
                <div key={si} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h4
                      className={cn(
                        "text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-border/20 bg-background/50",
                        style.accent,
                      )}
                    >
                      {section.name}
                    </h4>
                    <Separator className="flex-1 opacity-10" />
                  </div>

                  <div className="grid gap-4">
                    {section.exercises.map((ex, ei) => (
                      <div
                        key={ei}
                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/20 bg-background/60 p-5 transition-all hover:border-primary/20 hover:shadow-lg overflow-hidden"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-1.5">
                          <p className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                            <span className="h-6 w-6 flex items-center justify-center rounded bg-primary text-primary-foreground text-xs font-black border border-primary/20 shadow-lg shadow-primary/10">
                              {ei + 1}
                            </span>
                            {ex.name}
                          </p>
                          {ex.instructions && (
                            <p className="text-sm leading-relaxed text-foreground/90 max-w-md italic pl-8">
                              {ex.instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3 pl-8 sm:pl-0">
                          <div className="flex gap-2">
                            {ex.sets && (
                              <span
                                className={cn(
                                  "rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest border shadow-md bg-foreground text-background",
                                  style.border,
                                )}
                              >
                                {ex.sets} SETS
                              </span>
                            )}
                            {(ex.reps || ex.duration) && (
                              <span
                                className={cn(
                                  "rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest border shadow-md",
                                  style.badge,
                                )}
                              >
                                {ex.reps || ex.duration}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-foreground/70">
                            <Clock size={14} className="text-primary" />
                            <span className="text-xs uppercase tracking-widest">
                              Rest: {ex.rest}
                            </span>
                          </div>
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
    </Card>
  );
}

export default function WeeklyPlanDisplay({
  plan,
  onRegenerate,
  onExportMd,
  onExportTxt,
  onExportHtml,
  onExportPdf,
  onShare,
}: Props) {
  const activeDays = plan.days.filter((d) => !d.isRest).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-2xl mx-auto w-full px-2 sm:px-0"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-border/40 bg-muted/20 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
          <Zap size={14} className="text-primary fill-primary" />
          <span className="text-primary">{activeDays} Training Days</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="opacity-70">{plan.goal}</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {plan.weekTitle}
        </h2>

        <PlanActions
          onRegenerate={onRegenerate}
          onExportMd={onExportMd}
          onExportTxt={onExportTxt}
          onExportHtml={onExportHtml}
          onExportPdf={onExportPdf}
          onShare={onShare}
        />
      </div>

      <Separator className="bg-border/40" />

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {plan.days.map((d) => {
          const style = getDayStyle(d.isRest);
          return (
            <div
              key={d.day}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl py-4 transition-all border group",
                d.isRest
                  ? "opacity-30 border-transparent bg-muted/10"
                  : "border-primary/10 bg-card shadow-sm hover:border-primary/30 hover:scale-[1.05]",
              )}
            >
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                {d.day.slice(0, 3)}
              </span>
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  d.isRest ? "bg-muted-foreground/30" : "bg-primary",
                )}
              />
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-black uppercase tracking-tighter hidden sm:block",
                  style.text,
                )}
              >
                {d.isRest
                  ? "—"
                  : d.focus.length > 5
                    ? d.focus.split(" ")[0]
                    : d.focus}
              </span>
            </div>
          );
        })}
      </div>

      {/* Day cards */}
      <div className="grid gap-3">
        {plan.days.map((d) => (
          <DayCard key={d.day} day={d} />
        ))}
      </div>
    </motion.div>
  );
}
