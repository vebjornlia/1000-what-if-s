/**
 * The queue message editor pre-fills its "To" field with the card's current
 * effective contact (resolved_contact, else recipient_contact, else ""), so on
 * save it always hands back a contact string — never undefined. Persisting that
 * unconditionally overwrites `resolved_contact` and downgrades
 * `email_discovery_status` to "manual", which silently clobbers a discovered
 * email (losing its confidence/alternates) or writes a non-email
 * `recipient_contact` URL in as the address — even when the user only touched
 * the subject/body.
 *
 * Returns true only when the contact was meaningfully changed, so callers can
 * skip the overwrite when the user left the "To" field untouched. Comparison is
 * trimmed, so incidental surrounding whitespace does not count as an edit.
 */
export function contactWasEdited(
  original: string | null | undefined,
  edited: string | null | undefined
): boolean {
  return (edited ?? "").trim() !== (original ?? "").trim();
}
