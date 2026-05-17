"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanActionsProps {
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

export default function PlanActions({
  onRegenerate,
  canRegenerate = true,
}: PlanActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={!canRegenerate}
          className="h-8 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground"
        >
          <RotateCcw size={14} />
          Reforge
        </Button>
      )}
    </div>
  );
}
