// Basic email-shape check: one local part, one domain with a dot.
// Mirrors the EMAIL_RE used in email.ts so the queue's send action agrees
// with how discovered emails are validated.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * True when `value` is a syntactically valid email address usable as a Gmail
 * "to" recipient.
 *
 * A card's contact is often NOT a real email: it can be blank (no email was
 * discovered) or a non-email URL (e.g. a LinkedIn/Twitter link stored in
 * `recipient_contact`). Sending to those would open Gmail with a useless or
 * empty recipient, so they are not "sendable".
 */
export function isSendableEmail(value: string | null | undefined): boolean {
  if (!value) return false;
  return EMAIL_RE.test(value.trim());
}
