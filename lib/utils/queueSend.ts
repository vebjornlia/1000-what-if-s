export type SendableCard = {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
};

// Basic shape of an email-validity check: one local part, one domain with a
// dot. Kept local so this util stays self-contained and testable in isolation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * Picks the first syntactically-valid email for a queue card, preferring the
 * AI-resolved contact over the raw recipient contact (which is frequently a
 * non-email URL such as a booking or profile link). Returns null when neither
 * candidate is a usable email address.
 */
export function resolveSendableEmail(card: SendableCard): string | null {
  for (const candidate of [card.resolved_contact, card.recipient_contact]) {
    if (isValidEmail(candidate)) return (candidate as string).trim();
  }
  return null;
}

/**
 * Splits queue cards into those that have a sendable email address and those
 * that do not. Only sendable cards should be opened in Gmail and marked
 * "sent"; the rest must stay in the queue so those leads are not silently lost
 * behind an empty Gmail compose window.
 */
export function partitionSendable<T extends SendableCard>(
  items: T[]
): { sendable: { card: T; to: string }[]; skipped: T[] } {
  const sendable: { card: T; to: string }[] = [];
  const skipped: T[] = [];
  for (const card of items) {
    const to = resolveSendableEmail(card);
    if (to) sendable.push({ card, to });
    else skipped.push(card);
  }
  return { sendable, skipped };
}
