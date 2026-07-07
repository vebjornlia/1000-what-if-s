import { test } from "node:test";
import assert from "node:assert/strict";
import { getBoldnessBadge } from "./boldness.ts";

const RED = "bg-red-100 text-red-700";
const YELLOW = "bg-yellow-100 text-yellow-700";
const BLUE = "bg-blue-100 text-blue-700";

test("canonical lowercase values map to their colours", () => {
  assert.equal(getBoldnessBadge("low").className, BLUE);
  assert.equal(getBoldnessBadge("medium").className, YELLOW);
  assert.equal(getBoldnessBadge("high").className, RED);
});

test("colour lookup is case-insensitive (the original bug)", () => {
  // Before the fix "High" missed the map and rendered as medium (yellow)
  // while the label still read "High".
  assert.equal(getBoldnessBadge("High").className, RED);
  assert.equal(getBoldnessBadge("HIGH").className, RED);
  assert.equal(getBoldnessBadge("Low").className, BLUE);
});

test("surrounding whitespace does not break the colour lookup", () => {
  assert.equal(getBoldnessBadge("  high ").className, RED);
});

test("the display label preserves the original trimmed text", () => {
  assert.equal(getBoldnessBadge("High").label, "High");
  assert.equal(getBoldnessBadge("  low ").label, "low");
});

test("unknown values fall back to medium colour but keep their label", () => {
  const badge = getBoldnessBadge("aggressive");
  assert.equal(badge.className, YELLOW);
  assert.equal(badge.label, "aggressive");
});

test("untrusted prototype-style keys stay a plain string (medium)", () => {
  // Guards against an object lookup resolving inherited keys like
  // "constructor" to a non-string prototype value.
  for (const value of ["constructor", "toString", "hasOwnProperty"]) {
    const badge = getBoldnessBadge(value);
    assert.equal(badge.className, YELLOW);
    assert.equal(typeof badge.className, "string");
    assert.equal(badge.label, value);
  }
});

test("empty / nullish values default to the medium badge", () => {
  for (const value of ["", "   ", undefined, null]) {
    const badge = getBoldnessBadge(value as string | undefined | null);
    assert.equal(badge.className, YELLOW);
    assert.equal(badge.label, "medium");
  }
});
