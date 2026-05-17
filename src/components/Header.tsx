import React from "react";
import Link from "next/link";
import { CalendarDays, Dumbbell, Zap, History } from "lucide-react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Header() {
  const { user } = await withAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-xs">
      <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/10 ring-1 ring-primary/20">
            <Dumbbell size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">
            Regi<span className="text-primary">men</span>
          </span>
        </Link>
        {/* Desktop Nav Links */}
        {user && (
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
        )}

        {/* Global Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-primary/10 ring-offset-2 ring-offset-background transition-all hover:ring-primary/20">
                  <AvatarImage src={user.profilePictureUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/5 text-[10px] font-black text-primary">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 glass-darker">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem>
                  <Link
                    href="/weekly"
                    className="text-xs font-bold uppercase tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary"
                  >
                    Weekly planner
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/session"
                    className="text-xs font-bold uppercase tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary"
                  >
                    Single session
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/history"
                    className="text-xs font-bold uppercase tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary"
                  >
                    History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem>
                  <Link
                    href="/api/auth/logout"
                    className="w-full text-left text-xs font-bold uppercase tracking-wider text-destructive cursor-pointer focus:bg-destructive/5 focus:text-destructive px-2 py-1.5 rounded-sm outline-none"
                  >
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/api/auth/login"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary px-2"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
