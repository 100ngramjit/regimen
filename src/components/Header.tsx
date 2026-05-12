import React from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/10 ring-1 ring-primary/20">
            <Dumbbell size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">
            Fit<span className="text-primary">Forge</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
            Workouts
          </Link>
          <Link href="#" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
            Programs
          </Link>
          <Link href="#" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
            Community
          </Link>
          <div className="h-4 w-px bg-border/40 mx-1" />
          <ModeToggle />
          <button className="text-xs font-black uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground">
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
}
