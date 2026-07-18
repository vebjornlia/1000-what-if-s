import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSwipeProgress } from "./swipeProgress.ts";

test("first card of the deck reads 1 / N", () => {
  const r = computeSwipeProgress({ currentIndex: 0, totalCount: 40, hasCurrentCard: true });
  assert.deepEqual(r, { current: 1, total: 40, percent: 2.5 });
});

test("a middle card reflects its 1-based position", () => {
  const r = computeSwipeProgress({ currentIndex: 19, totalCount: 40, hasCurrentCard: true });
  assert.equal(r.current, 20);
  assert.equal(r.total, 40);
  assert.equal(r.percent, 50);
});

test("finished deck (no current card) reads N / N at 100% — the original bug", () => {
  // Before the fix the caller passed currentIndex 0 here, so the counter reset
  // to "1 / 40" at 2.5% the instant the user finished swiping.
  const r = computeSwipeProgress({ currentIndex: 0, totalCount: 40, hasCurrentCard: false });
  assert.deepEqual(r, { current: 40, total: 40, percent: 100 });
});

test("last card reads N / N at 100%", () => {
  const r = computeSwipeProgress({ currentIndex: 39, totalCount: 40, hasCurrentCard: true });
  assert.deepEqual(r, { current: 40, total: 40, percent: 100 });
});

test("a stale totalCount can never render a position beyond the total", () => {
  const r = computeSwipeProgress({ currentIndex: 45, totalCount: 40, hasCurrentCard: true });
  assert.equal(r.current, 40);
  assert.equal(r.percent, 100);
});

test("empty deck stays at 0 / 0 and never divides by zero", () => {
  const r = computeSwipeProgress({ currentIndex: 0, totalCount: 0, hasCurrentCard: false });
  assert.deepEqual(r, { current: 0, total: 0, percent: 0 });
});

test("non-finite inputs degrade safely", () => {
  const r = computeSwipeProgress({
    currentIndex: Number.NaN,
    totalCount: Number.POSITIVE_INFINITY,
    hasCurrentCard: true,
  });
  assert.deepEqual(r, { current: 0, total: 0, percent: 0 });
});
