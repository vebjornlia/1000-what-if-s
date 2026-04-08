"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Layers, Send, BarChart3, LogOut } from "lucide-react";

const navItems = [
  { href: "/deck", label: "Deck", icon: Layers },
  { href: "/queue", label: "Queue", icon: Send },
  { href: "/dashboard", label: "Stats", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Hide nav on onboarding
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFCFA]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/deck" className="flex items-center gap-2 font-[family-name:var(--font-playfair)] text-lg font-bold">
            <Sparkles className="h-5 w-5 text-accent-purple" />
            1000 What Ifs
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname === href
                    ? "bg-accent-purple/10 text-accent-purple"
                    : "text-muted hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
