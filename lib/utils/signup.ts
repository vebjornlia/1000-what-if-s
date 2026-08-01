/**
 * Interprets the result of a successful `supabase.auth.signUp` call.
 *
 * `signUp` resolving without an error does NOT mean the user has a usable
 * session. Two common cases return `error: null` yet must NOT navigate the
 * user into the (protected) app:
 *
 * 1. Email confirmation is enabled (the Supabase default): `session` is null
 *    and the user must click the link in their inbox before they can sign in.
 *    Pushing them straight to /onboarding bounces them back to /login via
 *    middleware, with no explanation.
 * 2. The email is already registered: to avoid leaking which addresses exist,
 *    Supabase returns a fabricated user with an empty `identities` array, no
 *    session, and no error.
 *
 * This helper distinguishes those from a genuine signed-in signup (which only
 * happens when confirmation is disabled) so the UI can react correctly.
 */
export type SignupStatus = "session" | "confirm_email" | "already_registered";

export interface SignupOutcome {
  status: SignupStatus;
  message: string;
}

interface SignupData {
  user?: { identities?: unknown[] | null } | null;
  session?: unknown | null;
}

export function interpretSignup(data: SignupData | null | undefined): SignupOutcome {
  // A real session means confirmation is off and the user is signed in now.
  if (data?.session) {
    return { status: "session", message: "" };
  }

  // Supabase signals "email already in use" with an empty identities array.
  const identities = data?.user?.identities;
  if (Array.isArray(identities) && identities.length === 0) {
    return {
      status: "already_registered",
      message: "An account with this email already exists. Try signing in instead.",
    };
  }

  // Otherwise a confirmation email was sent and we must wait for the click.
  return {
    status: "confirm_email",
    message: "Almost there! Check your email to confirm your account.",
  };
}
