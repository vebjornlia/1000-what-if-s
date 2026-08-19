/**
 * Sanitizes an untrusted post-auth redirect target (the OAuth `next` query
 * param) into a safe SAME-ORIGIN path.
 *
 * The callback route builds its redirect as `${origin}${next}`. Because
 * `origin` has no trailing slash, a `next` that does not begin with a single
 * "/" escapes the origin entirely and becomes an open redirect, e.g.
 *   next = "@evil.com"  -> "https://app.com@evil.com"   (host: evil.com)
 *   next = ".evil.com"  -> "https://app.com.evil.com"   (host: app.com.evil.com)
 *   next = "//evil.com" -> "https://app.com//evil.com"  (protocol-relative)
 *   next = "/\\evil.com" -> browsers normalize "\\" to "/", so "//evil.com"
 * Any of these lets a crafted login link phish an authenticated user.
 *
 * Only a path anchored at the site root ("/...") that is neither
 * protocol-relative ("//") nor backslash-tricked ("/\\") is allowed through;
 * everything else falls back to a known-safe default.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback: string = "/onboarding"
): string {
  if (!next) return fallback;
  // Must be anchored at the site root.
  if (next[0] !== "/") return fallback;
  // Reject protocol-relative ("//host") and backslash-normalized ("/\\host")
  // targets, which resolve to a different origin.
  if (next[1] === "/" || next[1] === "\\") return fallback;
  return next;
}
