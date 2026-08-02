export interface CategoryCount {
  name: string;
  value: number;
}

/**
 * Tallies what-if cards by category for the dashboard chart.
 *
 * Categories are produced by the AI, which is inconsistent about casing and
 * surrounding whitespace — the same recipient type comes back as "Podcast",
 * "podcast", or " Podcast " across cards. Counting the raw strings fragments
 * one real category into several near-duplicate slices/bars, misleading the
 * user about how their opportunities are distributed.
 *
 * We group case-insensitively on the trimmed label and count each group once,
 * displaying the first-seen (trimmed) label as the representative name. Blank
 * or missing categories collapse into a single "Uncategorized" group instead
 * of an unlabeled slice. Results are sorted by count desc, then name asc for a
 * stable, deterministic order.
 */
export function tallyCategories(
  cards: { category?: string | null }[]
): CategoryCount[] {
  const groups = new Map<string, CategoryCount>();

  for (const card of cards) {
    const label = (card.category ?? "").trim() || "Uncategorized";
    const key = label.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.value += 1;
    } else {
      groups.set(key, { name: label, value: 1 });
    }
  }

  return [...groups.values()].sort(
    (a, b) => b.value - a.value || a.name.localeCompare(b.name)
  );
}
