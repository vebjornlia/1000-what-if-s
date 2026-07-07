import { test } from "node:test";
import assert from "node:assert/strict";
import { deckProgress } from "./deckProgress.ts";

test("first card of the deck reads 1 / N with a small bar", () => {
  const p = deckProgress(0, 40);
  assert.deepEqual(p, { position: 1, total: 40, percent: 2.5 });
});

test("a middle card reflects its position", () => {
  const p = deckProgress(19, 40);
  assert.equal(p.position, 20);
  assert.equal(p.total, 40);
  assert.equal(p.percent, 50);
});

test("the last card reads N / N at 100%", () => {
  const p = deckProgress(39, 40);
  assert.deepEqual(p, { position: 40, total: 40, percent: 100 });
});

test("an exhausted deck stays at N / N and 100% (the original bug)", () => {
  // When the last card is swiped there is no top card, so callers pass
  // currentIndex 0 with exhausted=true. It must NOT snap back to 1 / 40.
  const p = deckProgress(0, 40, true);
  assert.deepEqual(p, { position: 40, total: 40, percent: 100 });
});

test("position and percent never exceed the total (clamped)", () => {
  const p = deckProgress(99, 40);
  assert.equal(p.position, 40);
  assert.equal(p.percent, 100);
});

test("a negative index is clamped up to the first position", () => {
  const p = deckProgress(-5, 40);
  assert.equal(p.position, 1);
  assert.equal(p.percent, 2.5);
});

test("zero or invalid totals produce empty, non-NaN progress", () => {
  for (const bad of [0, -3, NaN, Infinity]) {
    const p = deckProgress(0, bad as number);
    assert.deepEqual(p, { position: 0, total: 0, percent: 0 });
  }
});

test("a non-finite index falls back to the first position", () => {
  const p = deckProgress(NaN, 10);
  assert.equal(p.position, 1);
});
