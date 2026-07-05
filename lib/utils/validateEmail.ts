// Syntactic email check used by manual-entry UI (e.g. ContactWidget).
//
// Kept as a small standalone helper rather than reusing the discovery-focused
// helpers in email.ts, so UI components don't depend on that module. The regex
// intentionally mirrors the one email.ts applies to AI-discovered emails, so a
// manually typed address is held to the same "one local part, one dotted
// domain" standard: rejects "", "@", "foo@", "@bar.com", and "a@b" (no dot).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns true if `value` (after trimming) is a syntactically valid email.
 * Trimming means surrounding whitespace never counts as valid input and never
 * leaks into a stored/sent address.
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
