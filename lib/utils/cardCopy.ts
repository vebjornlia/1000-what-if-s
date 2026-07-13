/**
 * Builds the plain-text a user copies from a deck card's "Copy message" button.
 *
 * A whitespace-only subject is still "truthy", so a naive `subject ? ...` check
 * would copy a blank `Subject:` line (e.g. "Subject:  \n\n<body>"). Trim first:
 * only prepend a `Subject:` line when a non-blank subject actually exists, and
 * copy the trimmed subject so no stray edge whitespace leaks in.
 */
export function buildCardCopyText(card: {
  message_subject?: string;
  message_body: string;
}): string {
  const subject = card.message_subject?.trim();
  if (subject) {
    return `Subject: ${subject}\n\n${card.message_body}`;
  }
  return card.message_body;
}
