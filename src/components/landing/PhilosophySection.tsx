"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ShinyText from "@/components/ui/shiny-text";

export default function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          className="ornament-line mb-12"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="w-1.5 h-1.5 bg-primary/50 rotate-45" />
        </motion.div>

        <motion.span
          className="deco-label mb-8 block"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          The Philosophy
        </motion.span>

        <motion.p
          className="font-serif text-2xl sm:text-3xl md:text-4xl leading-snug text-foreground/90 mb-10 font-light"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          We believe that the body responds not to volume, but to{" "}
          <ShinyText text="intention" className="italic text-2xl sm:text-3xl md:text-4xl font-serif" /> — that every rep, every rest, every progression
          should be placed with the deliberation of a master craftsman selecting stone.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {[
            { number: "I", title: "Precision", desc: "Nothing arbitrary. Nothing accidental." },
            { number: "II", title: "Permanence", desc: "Built to endure, not to impress." },
            { number: "III", title: "Proportion", desc: "Every element in service of the whole." },
          ].map((item, i) => (
            <motion.div
              key={item.number}
              className="px-6 py-8 clay-card text-center flex flex-col items-center justify-center cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1 + i * 0.15, duration: 0.6 }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <div className="w-10 h-10 rounded-full clay-icon flex items-center justify-center mb-4 select-none pointer-events-none">
                <span className="text-primary font-black font-serif text-xs leading-none">{item.number}</span>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground/80 font-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="ornament-line mt-16"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="w-1.5 h-1.5 bg-primary/50 rotate-45" />
        </motion.div>
      </div>
    </section>
  );
}
