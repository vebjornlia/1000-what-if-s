// Pure aggregation for the dashboard. Kept side-effect free so it can be unit
// tested without a database or React.

export interface DashboardCard {
  status?: string | null;
  category?: string | null;
  got_reply?: boolean | null;
}

export interface DashboardStats {
  total: number;
  unseen: number;
  skipped: number;
  queued: number;
  sent: number;
  replied: number;
  categories: { name: string; value: number }[];
}

// Cards inserted out-of-band (or legacy rows) can carry a null/blank category.
// Bucketing those under a real label keeps the category chart from rendering a
// bar with a "null"/empty axis label.
export const UNCATEGORIZED = "Uncategorized";

export function computeDashboardStats(
  cards: DashboardCard[] | null | undefined
): DashboardStats {
  const list = Array.isArray(cards) ? cards : [];
  const categoryMap: Record<string, number> = {};
  let unseen = 0,
    skipped = 0,
    queued = 0,
    sent = 0,
    replied = 0;

  for (const card of list) {
    if (card.status === "unseen") unseen++;
    if (card.status === "skipped") skipped++;
    if (card.status === "queued") queued++;
    if (card.status === "sent") sent++;
    if (card.got_reply) replied++;

    const name =
      typeof card.category === "string" && card.category.trim()
        ? card.category.trim()
        : UNCATEGORIZED;
    categoryMap[name] = (categoryMap[name] || 0) + 1;
  }

  const categories = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    total: list.length,
    unseen,
    skipped,
    queued,
    sent,
    replied,
    categories,
  };
}
