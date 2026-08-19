import { test } from "node:test";
import assert from "node:assert/strict";
import { deckProgress } from "./deckProgress.ts";

test("normal case: 0-based index maps to 1-based position and percent", () => {
  const p = deckProgress(0, 20);
  assert.equal(p.position, 1);
  assert.equal(p.total, 20);
  assert.equal(p.percent, 5);
});

test("last card reads as full", () => {
  const p = deckProgress(19, 20);
  assert.equal(p.position, 20);
  assert.equal(p.total, 20);
  assert.equal(p.percent, 100);
});

test("empty deck shows 0 / 0 and 0% instead of 1 / 0", () => {
  const p = deckProgress(0, 0);
  assert.deepEqual(p, { position: 0, total: 0, percent: 0 });
});

test("stale total: index beyond total is clamped (no '21 / 20')", () => {
  const p = deckProgress(20, 20); // card_index 20 while total still 20
  assert.equal(p.position, 20);
  assert.equal(p.total, 20);
  assert.equal(p.percent, 100);
});

test("negative index never produces a negative position or percent", () => {
  const p = deckProgress(-5, 10);
  assert.equal(p.position, 0);
  assert.equal(p.percent, 0);
});

test("non-finite inputs are treated as zero", () => {
  assert.deepEqual(deckProgress(NaN, 10), { position: 1, total: 10, percent: 10 });
  assert.deepEqual(deckProgress(3, NaN), { position: 0, total: 0, percent: 0 });
});

test("fractional inputs are floored", () => {
  const p = deckProgress(2.9, 10.9);
  assert.equal(p.position, 3);
  assert.equal(p.total, 10);
  assert.equal(p.percent, 30);
});
