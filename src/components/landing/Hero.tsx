"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import ShinyText from "@/components/ui/shiny-text";

export default function Hero({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const sunburstLines = Array.from({ length: 24 }, (_, i) => i);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ y, opacity, scale, position: "relative" }}
    >
      {/* Sunburst background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.div
          className="relative w-[700px] h-[700px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {sunburstLines.map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-bottom"
              style={{
                width: "1px",
                height: "350px",
                transform: `translateX(-50%) rotate(${(i * 360) / 24}deg)`,
                background: `linear-gradient(to top, color-mix(in srgb, var(--primary) ${i % 3 === 0 ? "12%" : "6%"}, transparent), transparent)`,
              }}
            />
          ))}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-background/40 via-transparent to-background/80" />
        </motion.div>
      </div>

      {/* Floating Clay Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary/8 to-primary/3 filter blur-xs top-[18%] -left-[10%] md:left-[8%]"
          style={{
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.4), inset 8px 8px 16px rgba(255, 255, 255, 0.05), inset -8px -8px 16px rgba(0, 0, 0, 0.5)",
          }}
          animate={{
            x: [0, 30, -15, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.08, 0.94, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-52 h-52 md:w-80 md:h-80 rounded-full bg-gradient-to-tr from-primary/4 to-secondary/8 filter blur-xs bottom-[20%] -right-[15%] md:right-[5%]"
          style={{
            boxShadow:
              "0 25px 50px rgba(0, 0, 0, 0.5), inset 12px 12px 24px rgba(255, 255, 255, 0.04), inset -12px -12px 24px rgba(0, 0, 0, 0.6)",
          }}
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 35, -25, 0],
            scale: [1, 0.92, 1.06, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -mt-10 sm:-mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="mb-8"
        >
          <div className="ornament-line mb-8">
            <div className="w-1.5 h-1.5 bg-primary/50 rotate-45" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="mb-6"
        >
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.95] tracking-tight">
            <motion.span
              initial={{ y: 80, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
              transition={{
                delay: 1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="block text-foreground"
            >
              Stop searching,
            </motion.span>
            <motion.span
              initial={{ y: 80, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
              transition={{
                delay: 1.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="block"
            >
              <ShinyText
                text="start training."
                className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.95] tracking-tight"
              />
            </motion.span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-4 font-medium leading-relaxed"
        >
          Build weekly splits or single sessions around your equipment,
          schedule, goal, training level, and recovery needs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={isAuthenticated ? "/weekly" : "/api/auth/signup"}>
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{ scale: 0.96 }}
              className="px-10 py-5 clay-btn-primary"
            >
              Get Started
            </motion.button>
          </Link>

          {!isAuthenticated && (
            <Link href="/api/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="px-10 py-5 clay-btn-secondary"
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      />

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 2.8 }}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
          Scroll
        </span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-muted-foreground/40 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.section>
  );
}
