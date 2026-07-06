/**
 * A minimal structural view of the cookie container carried by a Next.js
 * response (`NextResponse#cookies`): it can list every cookie currently set on
 * the response and set a cookie object back onto it. Kept generic and
 * dependency-free so the copy logic below is pure and unit-testable without
 * constructing a real `NextResponse`.
 */
export interface ResponseCookieStore<Cookie> {
  getAll(): Cookie[];
  set(cookie: Cookie): unknown;
}

/**
 * Copy every cookie set on `source` onto `target`, preserving each cookie's
 * options (path, maxAge, httpOnly, etc.) by re-applying the whole cookie object.
 *
 * Why this exists: the Supabase SSR client refreshes the auth session by writing
 * rotated `sb-*` cookies onto the response object built inside `updateSession`.
 * When that function short-circuits with a `NextResponse.redirect(...)`, those
 * freshly-set cookies live on the ORIGINAL response and are silently dropped —
 * the browser never receives the `Set-Cookie` headers, so the refreshed session
 * is lost and the user can be bounced back to /login on the very next request
 * (an intermittent auth "flicker"/redirect loop). Re-applying the cookies onto
 * the redirect response keeps the session intact across the redirect.
 */
export function copyResponseCookies<Cookie>(
  source: ResponseCookieStore<Cookie>,
  target: ResponseCookieStore<Cookie>
): void {
  for (const cookie of source.getAll()) {
    target.set(cookie);
  }
}
