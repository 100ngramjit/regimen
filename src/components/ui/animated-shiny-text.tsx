import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
} from "react";

import { cn } from "@/lib/utils";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "inline-block bg-clip-text text-transparent",

        // Multiple backgrounds: Shimmer (layer 0) and Base Gradient (layer 1)
        "bg-[linear-gradient(110deg,transparent,35%,rgba(255,255,255,0.95),50%,rgba(255,255,255,0.95),65%,transparent),linear-gradient(to_right,var(--muted-foreground),var(--primary))]",

        // Background settings
        "bg-no-repeat",
        "[background-size:var(--shiny-width)_100%,100%_100%]",

        // Animation
        "animate-shiny-text",

        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
