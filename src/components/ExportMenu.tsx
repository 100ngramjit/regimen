"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  File,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExportPlan, ExportFormat, exportPlan } from "@/lib/workout-export";
import { Button } from "@/components/ui/button";

interface ExportMenuProps {
  plan: ExportPlan;
}

const FORMATS: { value: ExportFormat; label: string; icon: typeof FileText }[] =
  [
    { value: "sheets", label: "Sheets (CSV)", icon: FileSpreadsheet },
    { value: "md", label: "Markdown", icon: FileText },
    { value: "html", label: "HTML", icon: FileCode },
    { value: "pdf", label: "PDF", icon: File },
  ];

export default function ExportMenu({ plan }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null);
  const [portalRect, setPortalRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPortalRect({
        top: rect.bottom + 6,
        left: rect.right - 208,
        width: 208,
      });
    }
  }, [open]);

  const handleExport = (format: ExportFormat) => {
    exportPlan(plan, format);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 1500);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Download size={14} />
        Export
      </Button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && portalRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed rounded-xl glass-darker overflow-hidden z-50"
                style={{
                  top: portalRect.top,
                  left: portalRect.left,
                  width: portalRect.width,
                }}
              >
                <div className="p-1.5">
                  {FORMATS.map((fmt) => {
                    const Icon = fmt.icon;
                    const isCopied = copiedFormat === fmt.value;
                    return (
                      <button
                        key={fmt.value}
                        onClick={() => handleExport(fmt.value)}
                        disabled={isCopied}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-all hover:bg-primary/10 hover:text-foreground disabled:opacity-60"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground group-hover:bg-primary/10">
                          {isCopied ? (
                            <Check size={14} className="text-primary" />
                          ) : (
                            <Icon size={14} />
                          )}
                        </span>
                        <span className="flex-1 text-left">{fmt.label}</span>
                        {isCopied && (
                          <span className="text-[10px] font-semibold text-primary">
                            Done
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
