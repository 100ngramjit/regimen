import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ParsedInstructions {
  setup?: string | null;
  execution?: string | null;
  breathing?: string | null;
  tip?: string | null;
  fallback?: string | null;
}

export function parseInstructions(instructions?: string | null): ParsedInstructions | null {
  if (!instructions) return null;
  
  const setupMatch = instructions.match(/Setup:\s*(.*?)(?=\s*(Execution:|Breathing:|Tip:|$))/i);
  const executionMatch = instructions.match(/Execution:\s*(.*?)(?=\s*(Setup:|Breathing:|Tip:|$))/i);
  const breathingMatch = instructions.match(/Breathing:\s*(.*?)(?=\s*(Setup:|Execution:|Tip:|$))/i);
  const tipMatch = instructions.match(/Tip:\s*(.*?)(?=\s*(Setup:|Execution:|Breathing:|$))/i);

  if (!setupMatch && !executionMatch && !breathingMatch && !tipMatch) {
    return { fallback: instructions };
  }

  return {
    setup: setupMatch ? setupMatch[1].trim() : null,
    execution: executionMatch ? executionMatch[1].trim() : null,
    breathing: breathingMatch ? breathingMatch[1].trim() : null,
    tip: tipMatch ? tipMatch[1].trim() : null,
    fallback: null
  };
}
