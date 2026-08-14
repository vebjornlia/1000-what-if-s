export interface CategoryCount {
  name: string;
  value: number;
}

/**
 * Aggregates what-if cards into category counts for the dashboard chart.
 *
 * The `category` column is nullable with no DB default (see
 * supabase/migrations/001_initial.sql), so a card can arrive with a missing,
 * blank, or non-string category. Counting those directly keys the map on the
 * literal string "null"/"undefined" or an empty label, rendering a bogus,
 * unlabelled slice/bar in the analytics chart. Coalesce every unusable
 * category to "Uncategorized" so no counts are lost and no garbage label
 * appears. Results are sorted by count, highest first.
 */
export function aggregateCategories(
  cards: { category?: unknown }[]
): CategoryCount[] {
  const counts: Record<string, number> = {};

  for (const card of cards) {
    const raw = typeof card.category === "string" ? card.category.trim() : "";
    const name = raw || "Uncategorized";
    counts[name] = (counts[name] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
