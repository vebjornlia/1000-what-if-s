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
  if (card.message_subject) return card.message_subject;
  return `Quick question for ${card.recipient_name}`;
}
