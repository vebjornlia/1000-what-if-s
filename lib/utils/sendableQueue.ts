// Basic email-shape check: one local part, one domain with a dot.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface QueueContact {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}

/**
 * Returns the best sendable email for a queue card, or null when none of its
 * contact fields hold a syntactically valid email address.
 *
 * `resolved_contact` (from email discovery) is often null and
 * `recipient_contact` is frequently a non-email URL, so both must be validated
 * before a card can be treated as actually sendable.
 */
export function sendableEmail(card: QueueContact): string | null {
  const resolved = card.resolved_contact?.trim();
  if (resolved && EMAIL_RE.test(resolved)) return resolved;
  const recipient = card.recipient_contact?.trim();
  if (recipient && EMAIL_RE.test(recipient)) return recipient;
  return null;
}

/**
 * Splits queue cards into those with a valid email (safe to open in Gmail and
 * mark as sent) and those without (which must stay in the queue so the lead is
 * not silently lost when "Open All in Gmail" is used).
 */
export function partitionSendable<T extends QueueContact>(
  items: T[]
): { sendable: Array<{ card: T; to: string }>; skipped: T[] } {
  const sendable: Array<{ card: T; to: string }> = [];
  const skipped: T[] = [];
  for (const card of items) {
    const to = sendableEmail(card);
    if (to) sendable.push({ card, to });
    else skipped.push(card);
  }
  return { sendable, skipped };
}
