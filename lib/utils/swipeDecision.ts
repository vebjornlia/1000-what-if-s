export type SwipeDirection = "left" | "right" | "none";

/**
 * Decides whether a drag gesture counts as a swipe, from the horizontal
 * offset and velocity at drag end.
 *
 * A card swipes when the drag travels past `threshold` px OR is flicked faster
 * than `velocityThreshold` px/s — so a quick flick that never moves far still
 * registers, matching the real swipe deck (see components/deck/SwipeCard.tsx).
 * "right" is evaluated before "left", so a gesture that satisfies both (e.g.
 * dragged right but flicked left) resolves to "right", consistent with the deck.
 *
 * Defaults mirror the deck's thresholds (100 px / 500 px/s).
 */
export function getSwipeDecision(
  offsetX: number,
  velocityX: number,
  opts: { threshold?: number; velocityThreshold?: number } = {}
): SwipeDirection {
  const threshold = opts.threshold ?? 100;
  const velocityThreshold = opts.velocityThreshold ?? 500;

  if (offsetX > threshold || velocityX > velocityThreshold) return "right";
  if (offsetX < -threshold || velocityX < -velocityThreshold) return "left";
  return "none";
}
