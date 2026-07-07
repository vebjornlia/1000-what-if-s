// Decides which full-screen state the deck page should render.
//
// The subtlety this guards: the "brand-new user, generate your FIRST batch"
// empty screen and a returning user who has simply swiped through every card
// both have `visibleCards === 0`. They are only distinguishable by
// `totalCount`, which starts at 0 before the counts query resolves. Rendering
// the empty screen while counts are still loading makes returning users briefly
// see "No what-ifs yet" (with a "generate your first batch" call to action)
// even though they already have cards. So we stay on the loader until
// `countsLoaded` is true and we actually know how many cards exist.

export type DeckScreen = "loading" | "first-batch-empty" | "deck";

export interface DeckViewState {
  loading: boolean;
  generating: boolean;
  countsLoaded: boolean;
  visibleCards: number;
  totalCount: number;
}

export function getDeckScreen(state: DeckViewState): DeckScreen {
  const { loading, generating, countsLoaded, visibleCards, totalCount } = state;

  if (loading || generating || !countsLoaded) return "loading";
  if (visibleCards === 0 && totalCount === 0) return "first-batch-empty";
  return "deck";
}
