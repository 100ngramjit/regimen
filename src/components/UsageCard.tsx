"use client";

import React from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface UsageCardProps {
  usage: { count: number; limit: number; remaining: number } | null;
  isLoading: boolean;
}

export default function UsageCard({ usage, isLoading }: UsageCardProps) {
  return (
    <div className="rounded-xl glass-light p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
          <Zap size={13} className="text-primary" />
          Daily Generations
        </div>
        <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground/40">
          Resets at midnight
        </span>
      </div>
      {isLoading ? (
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted/30" />
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tight text-primary">
              {usage?.remaining ?? 0}
            </span>
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              of {usage?.limit ?? 2} left
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((usage?.remaining ?? 0) / (usage?.limit ?? 2)) * 100}%`,
              }}
              className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
