/**
 * Returns a safe, same-origin relative redirect path derived from an untrusted
 * `next` query parameter, falling back to `fallback` when `next` is missing or
 * unsafe.
 *
 * OAuth / magic-link callbacks echo a caller-supplied `next` back into a
 * redirect. Used verbatim it is an open redirect: e.g. `next=@evil.com` turns
 * `${origin}${next}` into `https://app.com@evil.com` — the browser reads
 * `app.com` as userinfo and navigates to `evil.com` (a phishing vector).
 * `next=//evil.com` or `next=/\evil.com` are protocol-relative tricks browsers
 * also resolve to another host.
 *
 * Only a path that begins with a single "/" (not "//" or "/\"), carries no
 * scheme/host, and contains no control characters (which could smuggle a
 * second header into the Location value) is allowed through unchanged.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback: string = "/"
): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  // Must be an absolute path on this origin.
  if (next[0] !== "/") return fallback;
  // Reject protocol-relative ("//host") and backslash-tricked ("/\host") URLs
  // that browsers resolve to a different host.
  if (next[1] === "/" || next[1] === "\\") return fallback;
  // Reject control chars (NUL, CR, LF, tab, DEL) that could inject a header.
  if (/[\x00-\x1f\x7f]/.test(next)) return fallback;
  return next;
}
