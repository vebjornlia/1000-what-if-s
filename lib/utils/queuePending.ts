// Statuses that mean email discovery for a queued card is still in flight and
// the queue view should keep polling for an update.
const PENDING_STATUSES = new Set(["pending", "searching"]);

/**
 * True when at least one queued item is still waiting on email discovery.
 *
 * A missing/empty `email_discovery_status` is treated as pending: the card was
 * just swiped and auto-discovery has not reported back yet. Used to decide
 * whether the queue page should refetch on its polling interval.
 */
export function hasPendingDiscovery(
  items: { email_discovery_status?: string | null }[]
): boolean {
  return items.some(
    (i) => !i.email_discovery_status || PENDING_STATUSES.has(i.email_discovery_status)
  );
}
