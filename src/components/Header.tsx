import React from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import HeaderNav from "./HeaderNav";
import AuthActions from "./AuthActions";
import UserMenu from "./UserMenu";

export default async function Header() {
  const { user } = await withAuth({ ensureSignedIn: false });

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-xs">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-5 sm:px-6">
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

        <HeaderNav user={user} />

        {/* Global Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {user ? <UserMenu user={user} /> : <AuthActions />}
        </div>
      </div>
    </header>
  );
}
