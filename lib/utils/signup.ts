// Interpret the result of a Supabase `auth.signUp` call.
//
// When email confirmation is enabled (this app relies on it — signup passes an
// `emailRedirectTo` and there is an /auth/callback route), a successful signUp
// returns a NULL session: the account exists but the user is not authenticated
// until they click the confirmation link. Redirecting into a protected route in
// that state just bounces them to /login with no explanation. Callers should
// instead show the returned message and keep the user on the signup screen.
//
// When confirmation is disabled, Supabase returns a live session and the user
// is logged in immediately, so callers can proceed into the app.

export interface SignUpOutcome {
  /** True when the user is authenticated now and can proceed into the app. */
  loggedIn: boolean;
  /** User-facing message to show when confirmation is still required, else null. */
  message: string | null;
}

// The "Check your email" prefix matches the login page's teal-styling check.
export const SIGNUP_CONFIRM_MESSAGE =
  "Check your email to confirm your account, then sign in.";

export function interpretSignUp(session: unknown | null | undefined): SignUpOutcome {
  if (session) {
    return { loggedIn: true, message: null };
  }
  return { loggedIn: false, message: SIGNUP_CONFIRM_MESSAGE };
}
