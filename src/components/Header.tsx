import React from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { withAuth, signOut } from '@workos-inc/authkit-nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { handleSignOut } from '@/lib/actions';

export default async function Header() {
  const { user } = await withAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/10 ring-1 ring-primary/20">
            <Dumbbell size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">
            Regi<span className="text-primary">men</span>
          </span>
        </Link>
        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 mr-auto ml-8">
          <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
            Workouts
          </Link>
          <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
            Programs
          </Link>
        </nav>

        {/* Global Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>

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
              <DropdownMenuContent align="end" className="w-56 mt-2 border-border/50 bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="text-xs font-bold uppercase tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-bold uppercase tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary">
                  Settings
                </DropdownMenuItem>
                <div className="sm:hidden">
                   <DropdownMenuSeparator className="bg-border/50" />
                   <div className="px-2 py-1.5 flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Theme</span>
                     <ModeToggle />
                   </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
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
              <div className="hidden sm:flex items-center gap-2 sm:gap-4">
                <Link
                  href="/api/auth/login"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary px-2"
                >
                  Sign In
                </Link>
              </div>
              <div className="sm:hidden ml-1">
                <ModeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
