// Email discovery for a queued card runs in the background, so the queue view
// polls for updates. These helpers decide when polling still has work to do so
// the poll can stop hitting the database once every card has resolved.

/** Statuses that mean email discovery for a card has not settled yet. */
const PENDING_STATUSES = new Set(["pending", "searching"]);

/**
 * A card still needs polling when its discovery status is missing (older rows
 * predate the column) or is one of the in-flight statuses. "found", "not_found"
 * and "manual" are terminal and need no further polling.
 */
export function hasPendingDiscovery(item: {
  email_discovery_status?: string | null;
}): boolean {
  const status = item.email_discovery_status;
  if (!status) return true;
  return PENDING_STATUSES.has(status);
}

/** True when at least one card in the queue is still awaiting discovery. */
export function queueHasPending(
  items: { email_discovery_status?: string | null }[]
): boolean {
  return items.some(hasPendingDiscovery);
}
