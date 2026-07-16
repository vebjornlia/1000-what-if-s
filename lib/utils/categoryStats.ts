export interface CategoryCount {
  name: string;
  value: number;
}

/**
 * Aggregate what-if cards into category counts for the dashboard chart.
 *
 * Categories come from the AI, which is inconsistent about casing and
 * whitespace ("Media", "media ", " Media"). Counting the raw string would
 * split one real category into several near-duplicate bars. This normalizes
 * by trimming and merging case-insensitively (keeping the first-seen casing as
 * the display label), and buckets missing/blank categories under
 * "Uncategorized" instead of rendering an empty-labeled bar.
 */
export function aggregateCategories(
  cards: { category?: string | null }[]
): CategoryCount[] {
  const counts = new Map<string, CategoryCount>();

  for (const card of cards) {
    const name = (card.category ?? "").trim() || "Uncategorized";
    const key = name.toLowerCase();
    const existing = counts.get(key);
    if (existing) {
      existing.value += 1;
    } else {
      counts.set(key, { name, value: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.value - a.value);
}
