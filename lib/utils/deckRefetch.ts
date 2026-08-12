/**
 * Decides whether the swipe deck should top itself up in the background.
 *
 * The deck keeps a small window of "unseen" cards in memory. As the user
 * swipes, cards are removed one at a time; once the *remaining* stack runs low
 * we quietly refetch more so the user never hits an empty deck mid-session.
 *
 * `remaining` must be the count AFTER the current swipe is applied (the card
 * being swiped is no longer part of the stack). Passing the pre-swipe count
 * causes an off-by-one that either refetches a swipe too early or too late.
 *
 * The refetch is a *background* top-up: callers should not flip the deck's
 * global loading state for it, or the whole deck flashes a loading screen on
 * every swipe near the bottom of the stack.
 */
export function shouldRefetchDeck(remaining: number, threshold = 5): boolean {
  if (!Number.isFinite(remaining)) return false;
  return remaining <= threshold;
}
