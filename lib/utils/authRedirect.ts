/**
 * Builds the URL that Supabase email links (magic link / OTP) should return to.
 *
 * Auth email links must come back through the app's `/auth/callback` route,
 * because that route is what calls `exchangeCodeForSession` and establishes the
 * SSR session cookies. Omitting this redirect (as the magic-link flow used to)
 * sends the user to the project's default Site URL instead, which never
 * exchanges the code — so the sign-in silently fails.
 *
 * @param origin  The current origin (e.g. `window.location.origin`). Trailing
 *                slashes are tolerated and stripped.
 * @param next    Internal path to land on after the code is exchanged. The
 *                callback route reads this from the `next` query param. Defaults
 *                to `/deck`; a missing leading slash is added.
 */
export function buildAuthCallbackUrl(origin: string, next: string = "/deck"): string {
  const base = origin.replace(/\/+$/, "");
  const safeNext = next.startsWith("/") ? next : `/${next}`;
  return `${base}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
