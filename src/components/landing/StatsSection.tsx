"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import ShinyText from "@/components/ui/shiny-text";

const stats = [
  { value: 98, suffix: "%", label: "Protocol Adherence Rate" },
  { value: 2.4, suffix: "x", label: "Faster Goal Achievement" },
  { value: 12, suffix: "K+", label: "Active Protocols" },
  { value: 47, suffix: "%", label: "Injury Reduction" },
];

function AnimatedCounter({ target, suffix, isInView }: { target: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);

      if (isDecimal) {
        setCount(parseFloat(current.toFixed(1)));
      } else {
        setCount(Math.floor(current));
      }

      if (step >= steps) {
        clearInterval(timer);
        setCount(target);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target, isDecimal]);

  return (
    <span>
      {isDecimal ? count.toFixed(1) : count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">
            Impact
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Measured in <ShinyText text="momentum" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" />
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="px-4 py-8 clay-card text-center flex flex-col items-center justify-center cursor-pointer"
              whileHover={{ y: -5, scale: 1.03 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 text-primary drop-shadow-[0_2px_8px_rgba(172,189,186,0.25)] select-none pointer-events-none"
                initial={{ scale: 0.8 }}
                animate={isInView ? { scale: 1 } : { scale: 0.8 }}
                transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} isInView={isInView} />
              </motion.div>
              <p className="text-[10px] sm:text-xs text-muted-foreground/80 font-black uppercase tracking-wider select-none pointer-events-none">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
