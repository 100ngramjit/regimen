"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "destructive-outline" | "ghost" | "link" | "outline" | "secondary"
  size?: "default" | "icon" | "icon-lg" | "icon-sm" | "icon-xl" | "icon-xs" | "lg" | "sm" | "xl" | "xs"
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    
    return (
      <Comp
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        disabled={disabled || loading}
        aria-disabled={loading ? "true" : undefined}
        data-loading={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
          {
            "bg-primary text-primary-foreground shadow-[0_4px_16px_-4px_rgba(172,189,186,0.3)] hover:opacity-90": variant === "default",
            "bg-red-600 text-white shadow-sm hover:bg-red-700": variant === "destructive",
            "border border-red-600 text-red-600 hover:bg-red-50": variant === "destructive-outline",
            "hover:bg-card/70 hover:text-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            "border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:bg-card/80 hover:text-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground shadow-sm hover:opacity-80": variant === "secondary",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-12 rounded-md px-10": size === "xl",
            "h-6 rounded-md px-2 text-xs": size === "xs",
            "h-9 w-9": size === "icon",
            "h-8 w-8": size === "icon-sm",
            "h-10 w-10": size === "icon-lg",
            "h-12 w-12": size === "icon-xl",
            "h-6 w-6": size === "icon-xs",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <span data-slot="button-loading-indicator" className="mr-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
        {loading ? (
          <span className="sr-only">{children}</span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
