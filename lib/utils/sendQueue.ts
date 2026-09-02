// Basic shape of an email-validity check: one local part, one domain with a dot.
// Kept local so this util is standalone (mirrors EMAIL_RE in ./email.ts).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(contact: unknown): boolean {
  return typeof contact === "string" && EMAIL_RE.test(contact.trim());
}

// The minimal shape of a queue card needed to decide if it can be sent.
export interface SendableCard {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}

/**
 * Splits queue cards into those with a sendable email and those without.
 *
 * "Open All in Gmail" opens a compose window per card using
 * `resolved_contact || recipient_contact`. Email discovery frequently returns
 * no address (resolved_contact null) and `recipient_contact` is often a
 * non-email URL, so many cards legitimately have no sendable address. Those
 * must NOT be opened blank or marked sent — they stay in the queue so the
 * opportunity is not silently lost.
 */
export function partitionSendable<T extends SendableCard>(
  items: T[]
): { sendable: T[]; skipped: T[] } {
  const sendable: T[] = [];
  const skipped: T[] = [];
  for (const item of items) {
    const contact = item.resolved_contact || item.recipient_contact || "";
    if (isValidEmail(contact)) sendable.push(item);
    else skipped.push(item);
  }
  return { sendable, skipped };
}
