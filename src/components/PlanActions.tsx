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
  { format: "sheets", label: "Google Sheets", icon: FileSpreadsheet },
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
    <div className="flex items-center gap-2">
      {exportData && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Download size={14} />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-40">
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.format}
                  className="gap-2 text-xs font-medium"
                  onSelect={() => exportPlan(exportData, option.format)}
                >
                  <Icon size={15} className="opacity-70" />
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
          className="h-8 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground"
        >
          <RotateCcw size={14} />
          Reforge
        </Button>
      )}
    </div>
  );
}
