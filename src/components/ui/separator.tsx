"use client"

import * as React from "react"
import * as Separator from "@base-ui/react/separator"
import { cn } from "@/lib/utils"

const SeparatorComponent = React.forwardRef<
  React.ElementRef<typeof Separator.Separator>,
  React.ComponentPropsWithoutRef<typeof Separator.Separator>
>(
  (
    { className, orientation = "horizontal", ...props },
    ref
  ) => (
    <Separator.Separator
      ref={ref}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
SeparatorComponent.displayName = "Separator"

export { SeparatorComponent as Separator }
