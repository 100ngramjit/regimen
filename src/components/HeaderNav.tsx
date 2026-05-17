"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Zap, History } from "lucide-react";
interface HeaderNavProps {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePictureUrl?: string | null;
  } | null;
}

export default function HeaderNav({ user }: HeaderNavProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (!user || isLanding) return null;

  return (
    <nav className="hidden md:flex items-center gap-6 mr-auto ml-8">
      <Link
        href="/weekly"
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <CalendarDays size={13} />
        Weekly
      </Link>
      <Link
        href="/session"
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Zap size={13} />
        Session
      </Link>
      <Link
        href="/history"
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <History size={13} />
        History
      </Link>
    </nav>
  );
}
