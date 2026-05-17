"use client";

import Hero from "./Hero";
import MomentumTicker from "./MomentumTicker";
import PhilosophySection from "./PhilosophySection";
import FeatureCards from "./FeatureCards";
import HowItWorks from "./HowItWorks";
import StatsSection from "./StatsSection";
import CTAClimax from "./CTAClimax";
import GeometricOrnament from "./GeometricOrnament";

interface LandingPageProps {
  isAuthenticated: boolean;
}

export default function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url('/bg-texture.png')`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
      <div className="relative z-10">
        <Hero isAuthenticated={isAuthenticated} />
        <MomentumTicker />
        <PhilosophySection />
        <GeometricOrnament />
        <FeatureCards />
        <GeometricOrnament />
        <HowItWorks />
        <StatsSection />
        <CTAClimax isAuthenticated={isAuthenticated} />
      </div>

      <footer className="relative z-10 border-t border-primary/10 py-10 text-center px-6">
        <div className="ornament-line mb-6">
          <div className="w-1 h-1 bg-primary/20 rotate-45" />
        </div>
        <p className="text-[9px] font-semibold tracking-[0.35em] uppercase text-muted-foreground/25">
          2026 Regimen — The Energy Architecture Atelier
        </p>
      </footer>
    </div>
  );
}
