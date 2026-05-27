"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import ShinyText from "@/components/ui/shiny-text";

const steps = [
  {
    number: "01",
    title: "Input Your Parameters",
    description: "Equipment, schedule, goals, limitations — the system ingests your constraints and begins mapping.",
  },
  {
    number: "02",
    title: "AI Architects Your Protocol",
    description: "Neural analysis generates a precision program calibrated to your physiology and objectives.",
  },
  {
    number: "03",
    title: "Execute With Confidence",
    description: "Follow the protocol knowing every rep, set, and rest period has been optimized for your body.",
  },
  {
    number: "04",
    title: "Adapt & Evolve",
    description: "The system learns from your feedback, adjusting load, volume, and intensity in real-time.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">
            Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Four beats. <ShinyText text="One rhythm." className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" />
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-1 bg-card/60 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),1px_1px_1px_rgba(255,255,255,0.05)]">
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-primary/80 to-primary/30 rounded-full shadow-[0_0_10px_rgba(172,189,186,0.6)]"
              style={{ height: lineHeight }}
            />
          </div>

          {steps.map((step, i) => (
            <Step key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      className="relative flex gap-6 sm:gap-10 mb-16 last:mb-0"
    >
      <motion.div
        className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 clay-sphere flex items-center justify-center shrink-0 cursor-pointer select-none"
        whileInView={{ scale: [0.8, 1] }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15 + 0.2, type: "spring", stiffness: 200 }}
      >
        <span className="text-xs sm:text-sm font-black text-background">
          {step.number}
        </span>
      </motion.div>

      <div className="pt-2 sm:pt-3">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2 text-foreground">
          {step.title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-lg font-light">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}
