// Same shape check used elsewhere for AI-discovered contacts: one local part,
// one domain with a dot. Kept local so this module has no cross-file coupling.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True only for a syntactically valid, single email address. */
export function isValidRecipientEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * Returns the address that can actually be *sent* to via Gmail/mailto for a
 * queue card, or "" when none is usable.
 *
 * A card's `recipient_contact` is frequently a non-email URL (LinkedIn, a
 * website, an X handle), and `resolved_contact` may be null. Treating those as
 * a sendable "to" both opens Gmail with a garbage recipient and — worse —
 * lets the UI mark the card as "sent", silently dropping a real lead from the
 * queue. Only a valid email counts as sendable.
 */
export function getSendableEmail(card: {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}): string {
  const resolved = card.resolved_contact?.trim() ?? "";
  if (isValidRecipientEmail(resolved)) return resolved;

  const recipient = card.recipient_contact?.trim() ?? "";
  if (isValidRecipientEmail(recipient)) return recipient;

  return "";
}
