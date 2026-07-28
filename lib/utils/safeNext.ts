/**
 * Sanitize a post-auth redirect target to prevent open-redirect attacks.
 *
 * The OAuth callback appends the caller-supplied `next` value to our own
 * origin (`${origin}${next}`). Because `next` comes straight from the query
 * string, values like `@evil.com`, `.evil.com`, or `//evil.com` resolve to an
 * attacker-controlled host once concatenated — a classic open redirect.
 *
 * Only allow same-origin, absolute-path destinations. Anything that could
 * escape our origin falls back to the default.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/onboarding"
): string {
  if (!next) return fallback;

  // Must be an absolute path on our own origin ("/deck", "/queue?x=1", ...).
  if (!next.startsWith("/")) return fallback;

  // Reject protocol-relative ("//host") and backslash-normalized ("/\host")
  // forms — browsers can treat these as an external host.
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;

  // Reject control characters (CR/LF/NUL) that could enable header injection.
  if (/[\x00-\x1f\x7f]/.test(next)) return fallback;

  return next;
}
