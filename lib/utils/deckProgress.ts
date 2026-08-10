/**
 * Computes the swipe-deck progress indicator (label position + bar percent).
 *
 * `currentCardIndex` is the 0-based `card_index` of the card currently on top,
 * or `null` when there is no top card (the deck has been swiped through). The
 * previous inline logic used `currentCard?.card_index || 0`, which collapsed
 * BOTH "no card left" and "the legitimate first card (index 0)" to 0 — so after
 * finishing the deck the bar snapped back to the start and the label read
 * "1 / N" instead of "N / N". Passing `null` for the exhausted case lets us
 * distinguish the two and show 100%.
 *
 * `position` is 1-based and clamped to [0, totalCount]; `percent` is clamped to
 * [0, 100]. When there are no cards at all, both are 0.
 */
export function deckProgress(
  currentCardIndex: number | null,
  totalCount: number
): { position: number; percent: number } {
  if (totalCount <= 0) return { position: 0, percent: 0 };

  // No current card => every card has been swiped => fully complete.
  if (currentCardIndex == null) return { position: totalCount, percent: 100 };

  const position = Math.min(Math.max(currentCardIndex + 1, 0), totalCount);
  const percent = Math.min((position / totalCount) * 100, 100);
  return { position, percent };
}
