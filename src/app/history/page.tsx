import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import HistoryClient from "@/components/HistoryClient";

export default async function HistoryPage() {
  const { user } = await withAuth();

  if (!user) {
    redirect("/api/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 py-6 md:py-10">
        <div className="max-w-4xl mx-auto">
          <HistoryClient />
        </div>
      </main>

      <footer className="border-t border-border/30 py-10 text-center px-6">
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground/50">
          2026 Regimen AI
        </p>
      </footer>
    </div>
  );
}
