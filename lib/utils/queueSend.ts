// Shape of a queue card, narrowed to the fields that decide where its message
// would be sent. Kept structural so callers can pass a full WhatIf.
export interface SendableCard {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}

// Basic shape of an email-validity check: one local part, one domain with a dot.
// Mirrors the check in email.ts; kept local so this util stands alone.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The address the queue would send a card to: the AI-resolved contact if
 * present, otherwise the raw recipient contact. Trimmed; never null.
 */
export function pickSendAddress(card: SendableCard): string {
  return (card.resolved_contact || card.recipient_contact || "").trim();
}

/** True only when the card resolves to a syntactically valid email address. */
export function hasSendableEmail(card: SendableCard): boolean {
  return EMAIL_RE.test(pickSendAddress(card));
}

/**
 * Splits queue cards into those that can actually be emailed and those that
 * cannot. "Send all via Gmail" must only open a compose window for — and mark
 * as sent — cards with a valid recipient email; cards with a blank or non-email
 * contact (e.g. a profile URL, or an unresolved discovery) stay in the queue so
 * the outreach is not silently lost.
 */
export function partitionSendable<T extends SendableCard>(
  items: T[]
): { sendable: T[]; skipped: T[] } {
  const sendable: T[] = [];
  const skipped: T[] = [];
  for (const item of items) {
    if (hasSendableEmail(item)) sendable.push(item);
    else skipped.push(item);
  }
  return { sendable, skipped };
}
