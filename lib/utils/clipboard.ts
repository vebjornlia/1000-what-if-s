/**
 * Formats the text placed on the clipboard by the queue's "Copy" button.
 *
 * Callers pass the already-resolved subject (via `getMessageSubject`, the same
 * helper the "Send via Gmail" path uses) so the copied text always carries a
 * proper subject line — never a blank/whitespace "Subject:    " leak or a
 * silently dropped subject.
 */
export function buildClipboardText(subject: string, body: string): string {
  return `Subject: ${subject}\n\n${body}`;
}
