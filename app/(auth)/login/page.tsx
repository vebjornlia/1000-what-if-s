"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/deck");
    router.refresh();
  }

  async function handleMagicLink() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setError("Check your email for a magic link!");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FCFCFA] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Welcome back
          </h1>
          <p className="mt-2 text-muted">Sign in to your what-ifs</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent-purple/50 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent-purple/50 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className={`text-sm ${error.includes("Check your email") ? "text-accent-teal" : "text-red-500"}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-bg py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full rounded-xl border border-border py-3 font-medium text-foreground transition hover:bg-gray-50 disabled:opacity-50"
          >
            Send Magic Link
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent-purple hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
