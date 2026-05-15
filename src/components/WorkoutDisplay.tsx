"use client";

import React from "react";
import { Workout } from "@/lib/schemas";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import PlanActions from "@/components/PlanActions";

interface Props {
  workout: Workout;
  onRegenerate: () => void;
  onAdjust: (type: "harder" | "easier") => void;
  onExportMd: () => void;
  onExportTxt: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onShare: () => void;
}

export default function WorkoutDisplay({
  workout,
  onRegenerate,
  onAdjust,
  onExportMd,
  onExportTxt,
  onExportHtml,
  onExportPdf,
  onShare,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-2xl mx-auto w-full px-2 sm:px-0"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
          <Clock size={14} className="animate-pulse" /> {workout.totalTime}{" "}
          Minute Session
        </div>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {workout.title}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <div className="flex items-center bg-muted/30 rounded-full p-1 border border-border/40 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAdjust("easier")}
              className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Make Easier"
            >
              <TrendingDown size={14} />
            </Button>
            <Separator orientation="vertical" className="h-4 mx-1 opacity-20" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAdjust("harder")}
              className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              title="Make Harder"
            >
              <TrendingUp size={14} />
            </Button>
          </div>

          <PlanActions
            onRegenerate={onRegenerate}
            onExportMd={onExportMd}
            onExportTxt={onExportTxt}
            onExportHtml={onExportHtml}
            onExportPdf={onExportPdf}
            onShare={onShare}
          />
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Sections */}
      <div className="space-y-16">
        {workout.sections.map((section, si) => (
          <div key={si} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 px-5 py-2 rounded-full border border-border/40 bg-muted/10 whitespace-nowrap">
                {section.name}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            </div>

            <div className="grid gap-4">
              {section.exercises.map((ex, ei) => (
                <Card
                  key={ei}
                  className="group relative border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/60 hover:shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/50 to-accent/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                            <span className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded bg-primary text-primary-foreground text-xs sm:text-sm font-black border border-primary/20 shadow-lg shadow-primary/10">
                              {ei + 1}
                            </span>
                            {ex.name}
                          </p>
                        </div>
                        {ex.instructions && (
                          <p className="text-base leading-relaxed text-foreground/90 max-w-lg pl-11 italic">
                            {ex.instructions}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-3 pl-11 md:pl-0">
                        <div className="flex items-center gap-3">
                          {ex.sets && (
                            <span className="rounded-lg bg-foreground text-background px-4 py-1.5 text-xs font-black uppercase tracking-widest border border-border/40 shadow-md">
                              {ex.sets} SETS
                            </span>
                          )}
                          {ex.reps && (
                            <span className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/20 shadow-sm">
                              {ex.reps} REPS
                            </span>
                          )}
                          {ex.duration && (
                            <span className="rounded-lg bg-secondary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-secondary border border-secondary/20 shadow-sm">
                              {ex.duration}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-foreground/70">
                          <Clock size={14} className="text-primary" />
                          <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                            Rest: {ex.rest}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <Button className="w-full h-16 rounded-2xl text-base font-black tracking-[0.3em] uppercase transition-all shadow-2xl hover:scale-[1.01] active:scale-[0.99] group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
          <CheckCircle2
            size={24}
            className="mr-3 group-hover:scale-110 transition-transform"
          />
          Finalize & Log Session
        </Button>
      </div>
    </motion.div>
  );
}
