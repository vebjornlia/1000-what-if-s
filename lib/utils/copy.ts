/**
 * Assembles the text placed on the clipboard by the deck's "Copy message"
 * button. The subject is resolved by the caller through `getMessageSubject`
 * (the same source of truth used when the email is actually sent), so this
 * helper stays a pure, dependency-free string assembler: given a resolved
 * subject it never leaks a blank "Subject:" header, and a missing body becomes
 * an empty string rather than the literal "undefined".
 */
export function buildCopyText(subject: string, body?: string): string {
  return `Subject: ${subject}\n\n${body ?? ""}`;
}
