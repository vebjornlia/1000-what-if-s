"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { interpretSignUp } from "@/lib/utils/signup";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // With email confirmation enabled, signUp returns no session — the user
    // isn't authenticated yet, so pushing into a protected route would bounce
    // them to /login. Show the confirmation prompt and keep them here instead.
    const outcome = interpretSignUp(data.session);
    if (!outcome.loggedIn) {
      setError(outcome.message ?? "");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FCFCFA] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Start your <span className="gradient-text">what ifs</span>
          </h1>
          <p className="mt-2 text-muted">Create an account to unlock 1,000 opportunities</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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
              minLength={6}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent-purple/50 transition"
              placeholder="At least 6 characters"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent-purple hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
