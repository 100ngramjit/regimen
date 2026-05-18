import React from "react";
import { parseInstructions } from "@/lib/utils";

interface Props {
  instructions?: string | null;
  className?: string;
}

export default function ExerciseInstructions({ instructions, className }: Props) {
  const parsed = parseInstructions(instructions);
  if (!parsed) return null;

  if (parsed.fallback) {
    return (
      <p className="mt-1.5 text-xs text-muted-foreground/70 leading-relaxed break-words">
        {parsed.fallback}
      </p>
    );
  }

  return (
    <div className="mt-2.5 space-y-2 text-xs leading-relaxed max-w-full">
      {parsed.setup && (
        <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[65px_1fr] items-start gap-1 sm:gap-2">
          <span className="font-extrabold text-[9px] sm:text-[10px] text-foreground/50 uppercase tracking-widest mt-0.5 select-none">
            Setup
          </span>
          <span className="text-muted-foreground/75 font-medium break-words">
            {parsed.setup}
          </span>
        </div>
      )}
      {parsed.execution && (
        <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[65px_1fr] items-start gap-1 sm:gap-2">
          <span className="font-extrabold text-[9px] sm:text-[10px] text-foreground/50 uppercase tracking-widest mt-0.5 select-none">
            Execute
          </span>
          <span className="text-muted-foreground/75 font-medium break-words">
            {parsed.execution}
          </span>
        </div>
      )}
      {parsed.breathing && (
        <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[65px_1fr] items-start gap-1 sm:gap-2">
          <span className="font-extrabold text-[9px] sm:text-[10px] text-foreground/50 uppercase tracking-widest mt-0.5 select-none">
            Breathe
          </span>
          <span className="text-muted-foreground/75 font-medium break-words">
            {parsed.breathing}
          </span>
        </div>
      )}
      {parsed.tip && (
        <div className="mt-3 border border-primary/15 bg-primary/5 rounded-xl px-3 py-2 flex items-start gap-2.5 max-w-full transition-colors hover:bg-primary/8">
          <span className="font-black text-[9px] sm:text-[10px] text-primary uppercase tracking-widest mt-0.5 select-none shrink-0">
            Tip
          </span>
          <span className="text-[11px] text-primary/90 leading-normal font-semibold break-words">
            {parsed.tip}
          </span>
        </div>
      )}
    </div>
  );
}
