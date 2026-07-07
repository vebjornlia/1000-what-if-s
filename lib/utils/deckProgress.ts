/**
 * Computes the swipe-deck progress display (label + bar width).
 *
 * `currentIndex` is the 0-based global index (`card_index`) of the card on top
 * of the deck; `totalCount` is the total number of cards generated for the user.
 *
 * When the deck is exhausted (the user swiped the last visible card, so there is
 * no card on top), progress is complete: every card has been dealt with, so it
 * must read as N / N at 100%. The previous inline logic collapsed the missing
 * card's index to 0, snapping the counter back to "1 / N" and the bar to ~2%
 * the instant the user finished — implying they'd barely started.
 *
 * Returns a clamped `position` (never exceeds `total`) and `percent` in [0, 100].
 */
export function deckProgress(
  currentIndex: number,
  totalCount: number,
  exhausted: boolean = false
): { position: number; total: number; percent: number } {
  if (!Number.isFinite(totalCount) || totalCount <= 0) {
    return { position: 0, total: 0, percent: 0 };
  }

  const safeIndex = Number.isFinite(currentIndex) ? currentIndex : 0;
  const position = exhausted
    ? totalCount
    : Math.min(Math.max(safeIndex + 1, 1), totalCount);
  const percent = Math.min((position / totalCount) * 100, 100);

  return { position, total: totalCount, percent };
}
