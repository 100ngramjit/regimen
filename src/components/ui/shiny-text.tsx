"use client";

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shineColor?: string;
  pauseOnHover?: boolean;
  delay?: number;
}

const ShinyText = ({
  text,
  disabled = false,
  className = "",
  pauseOnHover = false,
}: ShinyTextProps) => {
  return (
    <AnimatedShinyText
      className={`${disabled ? "pointer-events-none" : ""} ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""} ${className}`}
    >
      {text}
    </AnimatedShinyText>
  );
};

export default ShinyText;
