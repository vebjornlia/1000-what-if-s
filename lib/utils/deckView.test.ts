import { test } from "node:test";
import assert from "node:assert/strict";
import { getDeckScreen, type DeckViewState } from "./deckView.ts";

const base: DeckViewState = {
  loading: false,
  generating: false,
  countsLoaded: true,
  visibleCards: 0,
  totalCount: 0,
};

test("shows the loader while the deck is still loading", () => {
  assert.equal(getDeckScreen({ ...base, loading: true }), "loading");
});

test("shows the loader while a batch is generating", () => {
  assert.equal(getDeckScreen({ ...base, generating: true }), "loading");
});

test("stays on the loader until counts have loaded, even with zero cards", () => {
  // The regression: counts not yet fetched (totalCount still 0) must NOT be
  // mistaken for a brand-new user with no cards.
  assert.equal(
    getDeckScreen({ ...base, countsLoaded: false, visibleCards: 0, totalCount: 0 }),
    "loading"
  );
});

test("does not flash the first-batch screen for a returning user before counts load", () => {
  // Returning user who swiped through everything: no visible cards but plenty
  // of total cards. Before counts resolve this must be "loading", never the
  // first-batch empty screen.
  assert.equal(
    getDeckScreen({ ...base, countsLoaded: false, visibleCards: 0, totalCount: 40 }),
    "loading"
  );
  // Once counts load it becomes the normal deck (which surfaces the inline
  // "you've swiped through all visible cards" message), not the first-batch
  // empty screen.
  assert.equal(
    getDeckScreen({ ...base, countsLoaded: true, visibleCards: 0, totalCount: 40 }),
    "deck"
  );
});

test("shows the first-batch empty screen only when counts are loaded and there are truly zero cards", () => {
  assert.equal(
    getDeckScreen({ ...base, countsLoaded: true, visibleCards: 0, totalCount: 0 }),
    "first-batch-empty"
  );
});

test("shows the deck when there are visible cards", () => {
  assert.equal(
    getDeckScreen({ ...base, countsLoaded: true, visibleCards: 5, totalCount: 20 }),
    "deck"
  );
});
