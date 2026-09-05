export interface DeckProgress {
  /** 1-based position to show the user, clamped to [0, total]. */
  position: number;
  /** Total number of cards, never negative. */
  total: number;
  /** Progress bar fill percentage, clamped to [0, 100]. */
  percent: number;
}

/**
 * Compute what the swipe deck should display in its progress indicator.
 *
 * `currentIndex` is the 0-based index of the card currently on top, or
 * `null`/`undefined` when there is no card left to show (the deck has been
 * swiped through). Passing a non-null index for an exhausted deck used to make
 * the indicator reset to "1 / N" with a near-empty bar; treating "no card" as
 * completion keeps the indicator honest.
 */
export function deckProgress(
  currentIndex: number | null | undefined,
  totalCount: number
): DeckProgress {
  const total = Number.isFinite(totalCount) && totalCount > 0 ? Math.floor(totalCount) : 0;

  if (total === 0) {
    return { position: 0, total: 0, percent: 0 };
  }

  // No current card means the deck is complete: show the final position.
  if (currentIndex === null || currentIndex === undefined || !Number.isFinite(currentIndex)) {
    return { position: total, total, percent: 100 };
  }

  const position = Math.min(Math.max(Math.floor(currentIndex) + 1, 1), total);
  const percent = Math.min(Math.max((position / total) * 100, 0), 100);

  return { position, total, percent };
}
