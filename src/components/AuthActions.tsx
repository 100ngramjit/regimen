"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {isLoading ? (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 flex items-center gap-2">
          <Loader2 size={12} className="animate-spin" />
          Redirecting...
        </span>
      ) : (
        <Link
          href="/api/auth/login"
          onClick={handleClick}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary px-2"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
