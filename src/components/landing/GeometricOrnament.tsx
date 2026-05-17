"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function GeometricOrnament() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.4, 0.4, 0]);

  const steppedLines = Array.from({ length: 12 }, (_, i) => i);

  return (
    <motion.div
      ref={containerRef}
      className="relative h-24 sm:h-32 overflow-hidden"
      style={{ opacity }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-[300px] h-[80px]"
          style={{ rotate }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border border-primary/30 rotate-45" />
          </div>

          {steppedLines.map((i) => {
            const isLeft = i < 6;
            const offset = isLeft ? i : i - 6;
            const width = 20 + offset * 25;
            const left = isLeft ? `calc(50% - ${width + 10}px)` : `calc(50% + 10px)`;

            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 h-px"
                style={{
                  left,
                  width: `${width}px`,
                  background: `linear-gradient(${isLeft ? "to left" : "to right"}, color-mix(in srgb, var(--primary) 15%, transparent), transparent)`,
                }}
              />
            );
          })}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  );
}
