// Shape of a syntactically valid email: one local part, one domain with a dot.
// Kept local to this module so the manual-entry guard does not depend on the
// email-discovery utilities.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email a user typed into the manual-entry field.
 *
 * The manual-entry UI previously accepted anything containing "@", which let
 * obviously-broken values like "@", "a@", or "foo@" through. Those get stored
 * as the card's resolved contact and later used as the Gmail recipient, so the
 * card is marked "sent" while no real outreach can happen — a silently lost
 * lead. Only accept a syntactically valid, trimmed email.
 */
export function isValidManualEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return EMAIL_RE.test(value.trim());
}
