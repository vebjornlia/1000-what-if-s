export interface DeckProgress {
  /** 1-based position of the current card, clamped to [0, total]. */
  position: number;
  /** Total number of cards; never negative, never below `position`. */
  total: number;
  /** Completion percentage, always within [0, 100]. */
  percent: number;
}

/**
 * Computes the swipe-deck progress readout ("position / total" and the bar
 * width) from the current card's 0-based `card_index` and the total card count.
 *
 * These two inputs are fetched by separate effects in the deck page, so they
 * can be transiently inconsistent: right after generating a new batch the cards
 * (with a higher `card_index`) can load before the total count refreshes, and
 * an empty deck yields `totalCount` 0. Without clamping the UI would render
 * nonsense like "21 / 20" or "1 / 0" and a bar over 100%. This normalizes both
 * inputs so the position never exceeds the total and the percent stays in
 * [0, 100]. Non-finite inputs are treated as 0.
 */
export function deckProgress(
  currentIndex: number,
  totalCount: number
): DeckProgress {
  const total = Number.isFinite(totalCount) ? Math.max(0, Math.floor(totalCount)) : 0;

  if (total === 0) {
    return { position: 0, total: 0, percent: 0 };
  }

  const rawPosition = (Number.isFinite(currentIndex) ? Math.floor(currentIndex) : 0) + 1;
  const position = Math.min(Math.max(rawPosition, 0), total);
  const percent = Math.min(Math.max((position / total) * 100, 0), 100);

  return { position, total, percent };
}
