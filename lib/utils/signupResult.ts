/**
 * Interprets a Supabase `auth.signUp` success response so the UI can react
 * correctly to the three outcomes it hides behind a single non-error result.
 *
 * Supabase returns NO error in two surprising cases:
 *  - Email confirmation is enabled, so a real signup returns a user but NO
 *    session (the account is not usable until the emailed link is clicked).
 *  - The email is already registered: to avoid leaking account existence,
 *    Supabase returns a user with an EMPTY `identities` array and no session.
 *
 * The response is untrusted (shape may vary across SDK versions), so every
 * field is probed defensively.
 */
export type SignupOutcome = "confirmed" | "needs_confirmation" | "already_registered";

export function interpretSignupResult(data: unknown): SignupOutcome {
  const d = (data ?? {}) as {
    session?: unknown;
    user?: { identities?: unknown } | null;
  };

  // A session means the user is fully signed in (email confirmation is off).
  if (d.session) return "confirmed";

  // Enumeration-protection signal: an existing email yields a user object with
  // an empty identities array and no session. A brand-new signup always has at
  // least one identity, so an empty array only ever means "already registered".
  const identities = d.user?.identities;
  if (Array.isArray(identities) && identities.length === 0) {
    return "already_registered";
  }

  // A user but no session → a confirmation email was just sent.
  return "needs_confirmation";
}
