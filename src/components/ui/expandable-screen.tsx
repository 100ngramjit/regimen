"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableScreenContextType {
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  layoutId: string;
  triggerRadius: string;
  contentRadius: string;
  animationDuration: number;
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextType | null>(null);

export function useExpandableScreen() {
  const ctx = useContext(ExpandableScreenContext);
  if (!ctx) {
    throw new Error(
      "useExpandableScreen must be used within an ExpandableScreen",
    );
  }
  return ctx;
}

interface ExpandableScreenProps {
  children: ReactNode;
  layoutId?: string;
  triggerRadius?: string;
  contentRadius?: string;
  animationDuration?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  lockScroll?: boolean;
}

export function ExpandableScreen({
  children,
  layoutId = "expandable-card",
  triggerRadius = "100px",
  contentRadius = "24px",
  animationDuration = 0.3,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandChange,
  lockScroll = true,
}: ExpandableScreenProps) {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const expand = useCallback(() => {
    if (!isControlled) setInternalExpanded(true);
    onExpandChange?.(true);
  }, [isControlled, onExpandChange]);

  const collapse = useCallback(() => {
    if (!isControlled) setInternalExpanded(false);
    onExpandChange?.(false);
  }, [isControlled, onExpandChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        collapse();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, collapse]);

  useEffect(() => {
    if (lockScroll && isExpanded) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [lockScroll, isExpanded]);

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        expand,
        collapse,
        layoutId,
        triggerRadius,
        contentRadius,
        animationDuration,
      }}
    >
      {children}
    </ExpandableScreenContext.Provider>
  );
}

export function ExpandableScreenTrigger({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { isExpanded, expand, layoutId, triggerRadius, animationDuration } =
    useExpandableScreen();

  if (isExpanded) return null;

  return (
    <motion.div
      layoutId={layoutId}
      onClick={expand}
      style={{ borderRadius: triggerRadius }}
      transition={{
        duration: animationDuration,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={cn(
        "cursor-pointer will-change-transform",
        "transform-gpu",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function ExpandableScreenContent({
  children,
  className,
  showCloseButton = true,
  closeButtonClassName,
}: {
  children?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeButtonClassName?: string;
}) {
  const { isExpanded, collapse, layoutId, contentRadius, animationDuration } =
    useExpandableScreen();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isExpanded && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration * 0.6 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            onClick={collapse}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center overflow-y-auto">
            <motion.div
              layoutId={layoutId}
              style={{ borderRadius: contentRadius }}
              transition={{
                duration: animationDuration,
                ease: [0.23, 1, 0.32, 1],
              }}
              className={cn(
                "relative w-full max-w-4xl mx-auto mt-8 mb-8 will-change-transform transform-gpu",
                "bg-card/80 backdrop-blur-2xl border border-border/50 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)]",
                className,
              )}
            >
              {showCloseButton && (
                <button
                  onClick={collapse}
                  aria-label="Close"
                  className={cn(
                    "fixed top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-background/80 backdrop-blur-md border border-border/40 shadow-lg",
                    "text-muted-foreground hover:text-foreground transition-colors",
                    closeButtonClassName,
                  )}
                >
                  <X size={16} />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className,
}: {
  trigger?: ReactNode;
  content?: ReactNode;
  className?: string;
}) {
  const { isExpanded } = useExpandableScreen();
  return <div className={className}>{isExpanded ? content : trigger}</div>;
}
