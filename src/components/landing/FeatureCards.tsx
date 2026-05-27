"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, Brain, Target, Activity, Shield, TrendingUp } from "lucide-react";
import ShinyText from "@/components/ui/shiny-text";

const features = [
  {
    icon: Zap,
    title: "Energy Mapping",
    description: "Real-time analysis of your daily energy patterns, identifying peaks and valleys with precision.",
  },
  {
    icon: Brain,
    title: "Neural Adaptation",
    description: "AI that learns your rhythms, adapting protocols as your body evolves and responds.",
  },
  {
    icon: Target,
    title: "Precision Loading",
    description: "Exact volume, intensity, and frequency calibrated to your recovery capacity and goals.",
  },
  {
    icon: Activity,
    title: "Dynamic Recovery",
    description: "Protocols that shift with your sleep, stress, and readiness — never static, always optimal.",
  },
  {
    icon: Shield,
    title: "Injury Prevention",
    description: "Predictive load management that keeps you progressing while protecting your joints and tissues.",
  },
  {
    icon: TrendingUp,
    title: "Momentum Engine",
    description: "Compounding progress tracking that turns every session into fuel for the next breakthrough.",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 300, damping: 25 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative p-7 clay-card overflow-hidden h-full cursor-pointer"
        style={{
          rotateX: useTransform(smoothY, [-0.5, 0.5], [5, -5]),
          rotateY: useTransform(smoothX, [-0.5, 0.5], [-5, 5]),
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          <motion.div
            className="w-14 h-14 clay-icon flex items-center justify-center mb-5"
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
          >
            <feature.icon size={24} className="text-primary" />
          </motion.div>

          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-2.5 text-foreground">
            {feature.title}
          </h3>

          <p className="text-sm text-muted-foreground/80 leading-relaxed font-light">
            {feature.description}
          </p>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, var(--primary), transparent)`,
            opacity: 0,
            filter: "blur(1px)",
          }}
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            Engineered for{" "}
            <ShinyText text="transformation" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" />
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Six systems working in concert to optimize your energy, performance, and recovery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
