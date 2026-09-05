import { test } from "node:test";
import assert from "node:assert/strict";
import { deckProgress } from "./deckProgress.ts";

test("reports 1-based position for the current card", () => {
  assert.deepEqual(deckProgress(0, 20), { position: 1, total: 20, percent: 5 });
  assert.deepEqual(deckProgress(9, 20), { position: 10, total: 20, percent: 50 });
});

test("exhausted deck (no current card) shows the final position, not a reset to 1", () => {
  // This is the bug: a swiped-through deck used to display "1 / N".
  assert.deepEqual(deckProgress(null, 20), { position: 20, total: 20, percent: 100 });
  assert.deepEqual(deckProgress(undefined, 20), { position: 20, total: 20, percent: 100 });
});

test("last card reads as 100% complete", () => {
  assert.deepEqual(deckProgress(19, 20), { position: 20, total: 20, percent: 100 });
});

test("empty deck shows 0 / 0 at 0% instead of 1 / 0", () => {
  assert.deepEqual(deckProgress(0, 0), { position: 0, total: 0, percent: 0 });
  assert.deepEqual(deckProgress(null, 0), { position: 0, total: 0, percent: 0 });
});

test("clamps an out-of-range index to the total", () => {
  assert.deepEqual(deckProgress(50, 20), { position: 20, total: 20, percent: 100 });
});

test("guards against negative and non-finite inputs", () => {
  assert.deepEqual(deckProgress(-5, 20), { position: 1, total: 20, percent: 5 });
  assert.deepEqual(deckProgress(0, -3), { position: 0, total: 0, percent: 0 });
  assert.deepEqual(deckProgress(NaN, 20), { position: 20, total: 20, percent: 100 });
});
