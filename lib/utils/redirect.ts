/**
 * Sanitizes a user-supplied post-auth redirect target.
 *
 * The `next` query param on the auth callback is attacker-controllable, and it
 * is concatenated onto the app origin (`${origin}${next}`) to build the
 * redirect URL. Values like `@evil.com` turn `https://app.com` into
 * `https://app.com@evil.com`, whose real host is `evil.com` — a classic
 * open-redirect that browsers happily follow, ideal for post-login phishing.
 *
 * Only accept a genuine same-origin relative path: a single leading slash that
 * is not protocol-relative (`//host`) and not backslash-obfuscated. Anything
 * else falls back to a trusted in-app default.
 */
// Matches ASCII control chars (U+0000–U+001F); built from an escape so no
// literal control character appears in this source file.
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001f]");

export function safeRedirectPath(
  next: unknown,
  fallback: string = "/onboarding"
): string {
  if (typeof next !== "string") return fallback;

  const value = next.trim();

  // Must be a relative path rooted at "/".
  if (!value.startsWith("/")) return fallback;
  // Protocol-relative ("//evil.com") points at another origin.
  if (value.startsWith("//")) return fallback;
  // Browsers normalize backslashes to slashes, so "/\evil.com" can escape origin.
  if (value.includes("\\")) return fallback;
  // Control chars enable header/redirect injection.
  if (CONTROL_CHARS.test(value)) return fallback;

  return value;
}
