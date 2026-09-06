// Same shape check used by resolveBestEmail in ./email.ts: one local part,
// one domain with a dot. Kept local so this module has no cross-dependency.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True only for a syntactically valid email address (trimmed). */
export function isEmailAddress(value: string | null | undefined): boolean {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * The address to drop into a Gmail "to" field for a queue card.
 *
 * A card's contact is untrusted: `recipient_contact` from generation is often
 * a URL or social handle rather than an email, and `resolved_contact` may be
 * blank. Only return a value that is actually an email address — otherwise
 * return "" so the caller opens a blank Gmail draft (and labels the button
 * "Open in Gmail") instead of pre-filling the recipient with a URL that Gmail
 * cannot send to.
 */
export function getSendableEmail(card: {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}): string {
  const resolved = card.resolved_contact?.trim();
  if (isEmailAddress(resolved)) return resolved as string;

  const original = card.recipient_contact?.trim();
  if (isEmailAddress(original)) return original as string;

  return "";
}
