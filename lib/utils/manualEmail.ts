// Validation + normalization for a manually typed contact email.
//
// The manual-entry field in ContactWidget previously accepted anything
// containing "@" (e.g. "@", "a@", or a value padded with spaces like
// " bob@x "). Such a value was then persisted as the card's contact and later
// injected into the Gmail compose `to` param, silently breaking outreach.
//
// This mirrors the shape check used for AI-discovered emails in
// `lib/utils/email.ts` (one local part, one dotted domain, no whitespace),
// kept as a small standalone helper so both entry paths agree on validity.
const MANUAL_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim surrounding whitespace from a typed email before valid/persist. */
export function normalizeManualEmail(value: string): string {
  return value.trim();
}

/**
 * True only when the trimmed value is a syntactically valid email address.
 * Rejects blanks, whitespace-only input, and partials like "@" or "a@".
 */
export function isValidManualEmail(value: string): boolean {
  return MANUAL_EMAIL_RE.test(normalizeManualEmail(value));
}
