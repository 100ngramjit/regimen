"use client";

import { motion } from "framer-motion";

const items = [
  "ADAPTIVE RECOVERY",
  "NEURAL MAPPING",
  "ENERGY ARCHITECTURE",
  "CIRCADIAN SYNC",
  "LOAD OPTIMIZATION",
  "PEAK FREQUENCY",
  "MOMENTUM TRACKING",
  "SYSTEM BALANCE",
];

export default function MomentumTicker() {
  return (
    <section className="relative py-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 deco-divider" />
      <div className="absolute bottom-0 left-0 right-0 deco-divider" />

      <div className="flex">
        <motion.div
          className="flex gap-12 sm:gap-20 whitespace-nowrap"
          animate={{ x: [0, -1400] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <span
              key={i}
              className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground/30 flex items-center gap-5"
            >
              <span className="w-1 h-1 bg-primary/25 rotate-45" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
