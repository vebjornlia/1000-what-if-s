import { test } from "node:test";
import assert from "node:assert/strict";
import { deckProgress } from "./deckProgress.ts";

test("first card (index 0) reads 1 / N, not fully complete", () => {
  const { position, percent } = deckProgress(0, 20);
  assert.equal(position, 1);
  assert.equal(percent, 5);
});

test("mid-deck reports the 1-based position and matching percent", () => {
  const { position, percent } = deckProgress(9, 20);
  assert.equal(position, 10);
  assert.equal(percent, 50);
});

test("last card reports full position and 100%", () => {
  const { position, percent } = deckProgress(19, 20);
  assert.equal(position, 20);
  assert.equal(percent, 100);
});

test("exhausted deck (no current card) is complete, not reset to the start (the bug)", () => {
  const { position, percent } = deckProgress(null, 20);
  assert.equal(position, 20);
  assert.equal(percent, 100);
});

test("no cards at all yields zeroed progress", () => {
  assert.deepEqual(deckProgress(null, 0), { position: 0, percent: 0 });
  assert.deepEqual(deckProgress(0, 0), { position: 0, percent: 0 });
});

test("position and percent never exceed the total even if the index overshoots", () => {
  const { position, percent } = deckProgress(25, 20);
  assert.equal(position, 20);
  assert.equal(percent, 100);
});
