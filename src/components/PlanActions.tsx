"use client";

import {
  Code2,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExportFormat,
  ExportPlan,
  exportPlan,
} from "@/lib/workout-export";

interface PlanActionsProps {
  onRegenerate?: () => void;
  canRegenerate?: boolean;
  exportData?: ExportPlan;
}

const EXPORT_OPTIONS: {
  format: ExportFormat;
  label: string;
  icon: typeof FileText;
}[] = [
  { format: "sheets", label: "Sheets", icon: FileSpreadsheet },
  { format: "md", label: "Markdown", icon: FileText },
  { format: "html", label: "HTML", icon: Code2 },
  { format: "pdf", label: "PDF", icon: FileDown },
];

export default function PlanActions({
  onRegenerate,
  canRegenerate = true,
  exportData,
}: PlanActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {exportData && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              <Download size={16} />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-44">
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <DropdownMenuItem
                  key={option.format}
                  className="gap-2 text-xs font-bold uppercase tracking-wider"
                  onSelect={() => exportPlan(exportData, option.format)}
                >
                  <Icon size={15} />
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={!canRegenerate}
          className="h-10 gap-2 rounded-lg text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50"
        >
          <RotateCcw size={16} /> Reforge
        </Button>
      )}
    </div>
  );
}
