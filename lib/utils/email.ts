export function openGmailCompose(options: {
  to?: string;
  subject: string;
  body: string;
}) {
  const { to = "", subject, body } = options;
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  window.open(`https://mail.google.com/mail/?${params.toString()}`, "_blank");
}

export function openMailto(options: {
  to?: string;
  subject: string;
  body: string;
}) {
  const { to = "", subject, body } = options;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, "_blank");
}

// Basic shape of an email-validity check: one local part, one domain with a dot.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when `value` is a string holding a syntactically valid email address. */
export function isValidEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/**
 * The address a queued card would actually be sent to: the resolved contact if
 * valid, else the recipient contact if valid, else "". Email discovery often
 * returns not_found (resolved_contact null) and recipient_contact is frequently
 * a non-email URL, so a card can legitimately have no sendable address — callers
 * must not treat such cards as sent.
 */
export function getSendableEmail(card: {
  resolved_contact?: string | null;
  recipient_contact?: string | null;
}): string {
  const resolved = card.resolved_contact?.trim();
  if (isValidEmail(resolved)) return resolved as string;
  const recipient = card.recipient_contact?.trim();
  if (isValidEmail(recipient)) return recipient as string;
  return "";
}

/**
 * Picks the best contact email from a list of AI-discovered candidates.
 *
 * The AI response is untrusted: it may not be an array, may contain entries
 * without an `email` field, or may contain blank/malformed emails. Only
 * candidates with a syntactically valid email count as a successful discovery.
 * Returns the filtered candidates, the best (first valid) email, and a status
 * that is "found" only when at least one usable email exists.
 */
export function resolveBestEmail<T extends { email?: unknown }>(
  candidates: unknown,
  fallbackContact: string = ""
): { validCandidates: T[]; bestEmail: string; status: "found" | "not_found" } {
  const arr = Array.isArray(candidates) ? (candidates as T[]) : [];
  const valid = arr.filter(
    (c): c is T =>
      !!c &&
      typeof c === "object" &&
      typeof (c as { email?: unknown }).email === "string" &&
      EMAIL_RE.test((c as { email: string }).email.trim())
  );

  if (valid.length > 0) {
    return {
      validCandidates: valid,
      bestEmail: (valid[0] as { email: string }).email.trim(),
      status: "found",
    };
  }

  return { validCandidates: [], bestEmail: fallbackContact || "", status: "not_found" };
}

export function getMessageSubject(card: {
  recipient_name: string;
  message_subject?: string;
  category?: string;
}) {
  // A whitespace-only subject is still "truthy", so trim before deciding:
  // an empty/blank subject must fall back to the default rather than send a
  // blank subject line. Return the trimmed value so no stray edge whitespace
  // leaks into the email subject.
  const subject = card.message_subject?.trim();
  if (subject) return subject;
  return `Quick question for ${card.recipient_name}`;
}
