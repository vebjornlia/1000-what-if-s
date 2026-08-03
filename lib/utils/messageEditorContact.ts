/**
 * Decides what contact value the queue message editor should persist.
 *
 * The editor pre-fills its "To" field with the card's current contact
 * (`resolved_contact || recipient_contact`). If the user saves without touching
 * that field, we must NOT report the value back: the caller persists any defined
 * contact as `resolved_contact` and flips `email_discovery_status` to "manual".
 * Re-persisting an untouched value would clobber an in-progress email lookup or
 * promote a non-email URL (LinkedIn/website) into the send field.
 *
 * Returns the trimmed new value only when it actually changed; otherwise
 * `undefined`, which the caller treats as "leave the stored contact as-is".
 * Whitespace-only differences are ignored so they don't force a spurious update.
 */
export function resolveContactEdit(
  initial: string,
  current: string
): string | undefined {
  const before = (initial ?? "").trim();
  const after = (current ?? "").trim();
  return after === before ? undefined : after;
}
