import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldTopUpDeck, DECK_TOPUP_THRESHOLD } from "./deckTopUp.ts";

test("default threshold is 5", () => {
  assert.equal(DECK_TOPUP_THRESHOLD, 5);
});

test("tops up when the post-removal count reaches the threshold", () => {
  // 6 visible - 1 swiped = 5 remaining -> should top up.
  // The original code compared the pre-removal count (6 <= 5 -> false),
  // topping up one swipe too late; this test would have caught that.
  assert.equal(shouldTopUpDeck(6), true);
});

test("tops up when few cards remain", () => {
  assert.equal(shouldTopUpDeck(5), true); // 4 remaining
  assert.equal(shouldTopUpDeck(1), true); // 0 remaining
});

test("does not top up while the deck is comfortably full", () => {
  assert.equal(shouldTopUpDeck(7), false); // 6 remaining
  assert.equal(shouldTopUpDeck(20), false);
});

test("respects a custom threshold", () => {
  assert.equal(shouldTopUpDeck(4, 2), false); // 3 remaining > 2
  assert.equal(shouldTopUpDeck(3, 2), true); // 2 remaining <= 2
});
