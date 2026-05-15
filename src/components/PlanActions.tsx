"use client";

import {
  Download,
  FileCode,
  FileDown,
  FileText,
  RotateCcw,
  Share2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlanActionsProps {
  onExportMd: () => void;
  onExportTxt: () => void;
  onExportHtml: () => void;
  onExportPdf?: () => void;
  onShare: () => void;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

export default function PlanActions({
  onExportMd,
  onExportTxt,
  onExportHtml,
  onExportPdf,
  onShare,
  onRegenerate,
  canRegenerate = true,
}: PlanActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 rounded-lg border-primary/20 bg-primary/5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary/10"
          >
            <Download size={16} /> Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-lg border-primary/20 bg-card/95 p-2 backdrop-blur-md"
        >
          <DropdownMenuItem
            onClick={onExportMd}
            className="flex cursor-pointer items-center gap-3 rounded-md py-2.5 font-medium"
          >
            <FileText size={16} className="text-primary" /> Markdown
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportTxt}
            className="flex cursor-pointer items-center gap-3 rounded-md py-2.5 font-medium"
          >
            <Type size={16} className="text-secondary" /> Plain text
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportHtml}
            className="flex cursor-pointer items-center gap-3 rounded-md py-2.5 font-medium"
          >
            <FileCode size={16} className="text-accent" /> HTML
          </DropdownMenuItem>
          {onExportPdf && (
            <DropdownMenuItem
              onClick={onExportPdf}
              className="flex cursor-pointer items-center gap-3 rounded-md py-2.5 font-medium"
            >
              <FileDown size={16} className="text-destructive" /> PDF
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={onShare}
        className="h-10 gap-2 rounded-lg border-secondary/20 bg-secondary/5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-secondary/10"
      >
        <Share2 size={16} /> Share
      </Button>

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
