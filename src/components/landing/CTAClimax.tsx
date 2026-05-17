"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import ShinyText from "@/components/ui/shiny-text";

export default function CTAClimax({ isAuthenticated }: { isAuthenticated: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.3, 1]);

  return (
    <section ref={ref} className="relative py-32 sm:py-40 px-6 overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ scale, opacity }}
      >
        <motion.div
          className="w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{
            background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 40%, transparent) 0%, transparent 60%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, color-mix(in srgb, var(--secondary) 30%, transparent) 0%, transparent 60%)",
          }}
          animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="deco-label mb-6 block"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ready
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6 text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Stop searching,
            <br />
            <ShinyText text="start training." className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95]" />
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.7 }}
          >
            Build weekly splits or single sessions around your equipment,
            schedule, goal, training level, and recovery needs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={isAuthenticated ? "/weekly" : "/api/auth/signup"}>
              <motion.button
                whileHover={{
                  scale: 1.06,
                  boxShadow: "0 0 60px color-mix(in srgb, var(--primary) 40%, transparent), 0 0 120px color-mix(in srgb, var(--primary) 20%, transparent)",
                }}
                whileTap={{ scale: 0.97 }}
                className="relative cursor-pointer px-10 py-5 bg-primary text-background font-black text-sm uppercase tracking-[0.3em] rounded-xl overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-secondary"
                  style={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                />
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            className="mt-6 text-[10px] text-muted-foreground/50 font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
          >
            Free to start. No credit card required.
          </motion.p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
