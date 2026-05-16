"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

export default function AuthWall() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center"
        >
          <div className="text-center lg:text-left">
            <h1 className="mb-4 sm:mb-6 text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.06] tracking-tight">
              Stop searching,
              <br />
              <AnimatedShinyText shimmerWidth={300}>
                start training.
              </AnimatedShinyText>
            </h1>

            <p className="mx-auto mb-6 sm:mb-10 max-w-xl sm:max-w-2xl text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-muted-foreground lg:mx-0">
              Build weekly splits or single sessions around your equipment,
              schedule, goal, training level, and recovery needs.
            </p>

            <div className="mx-auto flex w-full max-w-sm lg:mx-0">
              <Link href="/api/auth/signup" className="w-full">
                <Button
                  size="lg"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-xs sm:text-sm font-black uppercase tracking-[0.18em] shadow-xl shadow-primary/10 whitespace-nowrap"
                >
                  Get Started<ArrowRight size={16} className="shrink-0" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-2 sm:gap-3">
            {[
              {
                icon: Zap,
                title: "Fast Planning",
                desc: "Turn rough constraints into a usable program.",
              },
              {
                icon: Target,
                title: "Better Fit",
                desc: "Adjust around equipment, time, level, and preferences.",
              },
              {
                icon: ShieldCheck,
                title: "Portable Output",
                desc: "Export, share, or rebuild plans without losing context.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="rounded-lg border border-border/40 bg-card/40 p-3 sm:p-5 backdrop-blur-sm"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon size={18} className="sm:size-5" />
                  </div>
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
