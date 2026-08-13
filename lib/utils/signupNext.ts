/**
 * Decides what should happen after a Supabase `auth.signUp` call succeeds.
 *
 * Supabase only returns a `session` when the new account is immediately
 * usable — i.e. email confirmation is disabled. When confirmation is required
 * (the default), or when the email is already registered (Supabase returns a
 * success with no session to avoid leaking account existence), `session` is
 * null and the user has no auth cookie yet. Redirecting to a protected route
 * in that case just bounces them straight back to /login with no explanation,
 * so the caller should instead prompt them to confirm via the emailed link.
 */
export interface SignupResultData {
  session?: unknown | null;
}

export type SignupNext = { kind: "redirect" } | { kind: "confirm" };

export function resolveSignupNext(
  data: SignupResultData | null | undefined
): SignupNext {
  if (data && data.session) {
    return { kind: "redirect" };
  }
  return { kind: "confirm" };
}
