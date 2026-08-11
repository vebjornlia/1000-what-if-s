/**
 * Sanitizes an untrusted post-auth redirect target (the `next` query param)
 * into a safe, in-app relative path.
 *
 * The value comes straight from the request URL, so it is untrusted. Only a
 * rooted path such as "/deck" is allowed through; protocol-relative ("//host"),
 * backslash-obfuscated ("/\\host"), absolute ("https://host"), blank, and
 * non-string values all fall back to a known-safe default. This keeps the
 * login redirect pointed at our own app instead of an attacker-influenced
 * destination, even as it is concatenated onto the request origin.
 */
export function sanitizeRedirectPath(
  next: unknown,
  fallback: string = "/onboarding"
): string {
  if (typeof next !== "string") return fallback;

  const value = next.trim();

  // Must be a rooted, single-slash path (e.g. "/deck" or "/deck?x=1").
  if (!value.startsWith("/")) return fallback;

  // Reject protocol-relative ("//host") and backslash tricks ("/\\host")
  // that a browser could resolve to a different origin.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  // Reject control characters (CR/LF, NUL, etc.) that could distort the
  // Location header or the resolved redirect target.
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return fallback;
  }

  return value;
}
