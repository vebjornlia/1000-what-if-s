/**
 * Decide whether a message-editor "To" field edit should update the stored
 * contact.
 *
 * The editor pre-fills its "To" input from the card's existing contact
 * (`resolved_contact || recipient_contact`). A user who opens the editor only
 * to tweak the message body leaves that field untouched — but if the editor
 * unconditionally reports the value back, the caller overwrites the resolved
 * email (often with a non-email URL such as a LinkedIn/website link) and flips
 * the email-discovery status to "manual". That silently corrupts the recipient.
 *
 * Returns the trimmed contact only when the user actually changed it, or
 * `undefined` when it is unchanged so callers can skip the contact update
 * entirely (the caller guards on `contact !== undefined`).
 */
export function resolveContactEdit(
  initial: string,
  current: string
): string | undefined {
  const trimmedCurrent = current.trim();
  if (trimmedCurrent === initial.trim()) return undefined;
  return trimmedCurrent;
}
