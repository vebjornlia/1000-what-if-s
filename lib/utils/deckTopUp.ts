// How many still-visible cards may remain before the deck fetches a fresh
// batch in the background. Kept small so the user never hits an empty deck.
export const DECK_TOPUP_THRESHOLD = 5;

/**
 * After a swipe removes one card from the visible deck, decide whether to
 * fetch more cards.
 *
 * `visibleCount` is the number of cards BEFORE the just-swiped card is
 * removed, so the true remaining count is `visibleCount - 1`. Comparing the
 * pre-removal count directly (the original bug) tops up one swipe too late.
 */
export function shouldTopUpDeck(
  visibleCount: number,
  threshold: number = DECK_TOPUP_THRESHOLD
): boolean {
  return visibleCount - 1 <= threshold;
}
