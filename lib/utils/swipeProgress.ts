/**
 * Computes the deck progress counter ("X / Y") and bar percentage shown in
 * the deck's SwipeStats header.
 *
 * `currentIndex` is the 0-based index of the current (top) card and
 * `totalCount` is the total number of cards in the deck. When there is no
 * current card — i.e. the loaded deck has been fully swiped — the deck is
 * complete: the counter should read "Y / Y" at 100%.
 *
 * Previously the caller fell back to index 0 when no card was present, so the
 * moment the user finished the deck the counter jumped back to "1 / Y" and the
 * bar collapsed to ~0%. The 1-based position is also clamped into [1, total]
 * so a momentarily stale `totalCount` can never render "41 / 40".
 */
export function computeSwipeProgress(params: {
  currentIndex: number;
  totalCount: number;
  hasCurrentCard: boolean;
}): { current: number; total: number; percent: number } {
  const total =
    Number.isFinite(params.totalCount) && params.totalCount > 0
      ? Math.floor(params.totalCount)
      : 0;

  if (total === 0) {
    return { current: 0, total: 0, percent: 0 };
  }

  if (!params.hasCurrentCard) {
    return { current: total, total, percent: 100 };
  }

  const index = Number.isFinite(params.currentIndex)
    ? Math.floor(params.currentIndex)
    : 0;
  const current = Math.min(Math.max(index + 1, 1), total);
  const percent = (current / total) * 100;

  return { current, total, percent };
}
