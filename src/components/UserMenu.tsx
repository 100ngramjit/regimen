"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePictureUrl?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    setIsLoading(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 outline-none"
        disabled={isLoading}
      >
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
          <span className="text-xs font-black tracking-wider">
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
            className="text-xs font-bold tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary"
          >
            Weekly planner
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="/session"
            className="text-xs font-bold tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary"
          >
            Single session
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="/history"
            className="text-xs font-bold tracking-wider cursor-pointer focus:bg-primary/5 focus:text-primary"
          >
            History
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem>
          {isLoading ? (
            <span className="w-full text-left text-xs font-bold tracking-wider text-muted-foreground px-2 py-1.5 rounded-sm flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Signing out...
            </span>
          ) : (
            <Link
              href="/api/auth/logout"
              onClick={handleSignOut}
              className="w-full text-left text-xs font-bold tracking-wider text-destructive cursor-pointer focus:bg-destructive/5 focus:text-destructive px-2 py-1.5 rounded-sm outline-none"
            >
              Sign Out
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
