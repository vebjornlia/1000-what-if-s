// Basic shape of an email-validity check: one local part, one domain with a dot.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True only for a syntactically valid email address (after trimming). */
export function isEmailAddress(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * Picks the address to hand to Gmail's `to:` field for a queue card.
 *
 * `recipient_contact` is a free-form field that is frequently a non-email URL
 * (e.g. a website or social profile), and `resolved_contact` can be null or a
 * placeholder. Dropping a non-email string into Gmail's `to:` produces a broken
 * compose window with a garbage recipient. Only a syntactically valid email is
 * returned; otherwise "" so the caller can offer a blank ("Open in Gmail")
 * compose instead of pretending a real recipient exists.
 */
export function effectiveEmail(card: {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}): string {
  if (isEmailAddress(card.resolved_contact)) return card.resolved_contact!.trim();
  if (isEmailAddress(card.recipient_contact)) return card.recipient_contact!.trim();
  return "";
}
