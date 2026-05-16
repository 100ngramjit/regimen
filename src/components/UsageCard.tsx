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
    <div className="rounded-lg border border-border/40 bg-card/35 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        <Zap size={15} className="text-primary" />
        Daily Allowance
      </div>
      {isLoading ? (
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/30" />
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight text-primary">
              {usage?.remaining ?? 0}
            </span>
            <span className="mb-1 text-xs font-bold text-muted-foreground">
              OF {usage?.limit ?? 2} LEFT
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((usage?.remaining ?? 0) / (usage?.limit ?? 2)) * 100}%`,
              }}
              className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Resets at midnight
          </p>
        </div>
      )}
    </div>
  );
}
