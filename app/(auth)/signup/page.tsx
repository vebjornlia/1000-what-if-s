"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { interpretSignup } from "@/lib/utils/signup";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

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

    // A successful signUp does not guarantee a session: with email
    // confirmation on (the default) the user must click the link first, and
    // an already-registered email returns no session either. Only navigate
    // into the app when we actually have a session.
    const outcome = interpretSignup(data);
    if (outcome.status === "session") {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setNotice(outcome.message);
    setLoading(false);
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

          {error && <p className="text-sm text-red-500">{error}</p>}
          {notice && <p className="text-sm text-accent-teal">{notice}</p>}

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
