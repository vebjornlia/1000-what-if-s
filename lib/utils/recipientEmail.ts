// One local part, one domain with a dot — mirrors the shape check used for
// AI-discovered emails in lib/utils/email.ts.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns true only for a syntactically valid email address (trimmed).
 * Anything else — a website/social URL, a blank string, null — is rejected.
 */
export function isEmailAddress(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * Chooses the value to prefill an email "To" field with for a queued card.
 *
 * Card contacts are untrusted: the generation prompt explicitly falls back to a
 * website/social URL when it has no email, and email discovery frequently
 * resolves nothing. Seeding the "To" field with a URL (or blank) would let a
 * user save an unsendable address as the recipient. Only a syntactically valid
 * email prefills the field — otherwise return "" so the composer starts blank.
 */
export function initialRecipientEmail(
  resolvedContact?: string | null,
  recipientContact?: string | null
): string {
  if (isEmailAddress(resolvedContact)) return resolvedContact.trim();
  if (isEmailAddress(recipientContact)) return recipientContact.trim();
  return "";
}
