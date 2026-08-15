// Basic shape of an email-validity check: one local part, one domain with a dot.
// Mirrors EMAIL_RE in ./email.ts, kept local so this helper stays self-contained.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Picks the initial "To" value for the message editor.
 *
 * A discovered `resolved_contact` is already a validated email address, so it
 * wins as-is. The AI-provided `recipient_contact`, however, is frequently a URL
 * (LinkedIn profile, website, X handle) rather than an email — see
 * lib/ai/prompts.ts, which instructs the model to fall back to a URL when no
 * email is known. Dropping a URL into an email "To" field is misleading and
 * produces a broken send, so `recipient_contact` only prefills the field when
 * it is a syntactically valid email. Otherwise we return "" and let the user
 * type a real address.
 */
export function initialRecipient(card: {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}): string {
  const resolved = card.resolved_contact?.trim();
  if (resolved) return resolved;

  const contact = card.recipient_contact?.trim();
  if (contact && EMAIL_RE.test(contact)) return contact;

  return "";
}
