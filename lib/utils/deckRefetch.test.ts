import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldRefetchDeck } from "./deckRefetch.ts";

test("refetches when the remaining stack is at the threshold", () => {
  assert.equal(shouldRefetchDeck(5), true);
});

test("refetches when the remaining stack is below the threshold", () => {
  assert.equal(shouldRefetchDeck(0), true);
  assert.equal(shouldRefetchDeck(3), true);
});

test("does not refetch while the stack is comfortably full", () => {
  assert.equal(shouldRefetchDeck(6), false);
  assert.equal(shouldRefetchDeck(20), false);
});

test("honors a custom threshold", () => {
  assert.equal(shouldRefetchDeck(8, 10), true);
  assert.equal(shouldRefetchDeck(11, 10), false);
});

test("off-by-one guard: post-swipe count of 6 from a 7-card stack does not refetch early", () => {
  // A 7-card stack swiped once leaves 6 remaining -> still above threshold.
  const stackBeforeSwipe = 7;
  const remainingAfterSwipe = stackBeforeSwipe - 1;
  assert.equal(shouldRefetchDeck(remainingAfterSwipe), false);
});

test("ignores non-finite remaining counts instead of refetching", () => {
  assert.equal(shouldRefetchDeck(Number.NaN), false);
  assert.equal(shouldRefetchDeck(Number.POSITIVE_INFINITY), false);
});
