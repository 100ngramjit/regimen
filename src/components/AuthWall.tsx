"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

export default function AuthWall() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-5 py-8 sm:px-6 sm:py-12 overflow-hidden">
      <div className="relative w-full max-w-4xl">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center text-center"
        >
          <h1 className="mb-6 text-4xl font-black leading-[1.1] tracking-tighter sm:text-7xl lg:text-8xl">
            AI-built workouts, <br />
            <AnimatedShinyText shimmerWidth={300}>
              real results.
            </AnimatedShinyText>
          </h1>

          <p className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
            Elite AI-driven fitness engineering is reserved for members. Join
            the collective to unlock precision training protocols tailored to
            your DNA.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
            <Link href="/api/auth/login" className="w-full">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
              >
                Get Started <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3 w-full">
            {[
              {
                icon: Zap,
                title: "AI Precision",
                desc: "Neuro-specific training loads",
              },
              {
                icon: Target,
                title: "Bio-Adaptive",
                desc: "Environmentally aware protocols",
              },
              {
                icon: ShieldCheck,
                title: "Verified",
                desc: "Scientific-grade programming",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              >
                <Card className="border-border/40 bg-card/30 backdrop-blur-md transition-all hover:border-primary/30">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
