import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeBoldness, boldnessBadgeClass } from "./boldness.ts";

const RED = "bg-red-100 text-red-700";
const YELLOW = "bg-yellow-100 text-yellow-700";
const BLUE = "bg-blue-100 text-blue-700";

test("passes through the canonical lowercase levels", () => {
  assert.equal(normalizeBoldness("low"), "low");
  assert.equal(normalizeBoldness("medium"), "medium");
  assert.equal(normalizeBoldness("high"), "high");
});

test("normalizes mis-cased levels from the model (the original bug)", () => {
  assert.equal(normalizeBoldness("High"), "high");
  assert.equal(normalizeBoldness("HIGH"), "high");
  assert.equal(normalizeBoldness("Low"), "low");
});

test("trims surrounding whitespace before matching", () => {
  assert.equal(normalizeBoldness("  high  "), "high");
  assert.equal(normalizeBoldness("\tmedium\n"), "medium");
});

test("falls back to medium for unknown or missing values", () => {
  for (const bad of ["", "   ", "aggressive", undefined, null, 3, {}]) {
    assert.equal(normalizeBoldness(bad as unknown), "medium");
  }
});

test("boldnessBadgeClass returns the class matching the normalized level", () => {
  // The bug: a "high" person used to render with the medium (yellow) class.
  assert.equal(boldnessBadgeClass("High"), RED);
  assert.equal(boldnessBadgeClass("high"), RED);
  assert.equal(boldnessBadgeClass("low"), BLUE);
  assert.equal(boldnessBadgeClass("Medium"), YELLOW);
});

test("boldnessBadgeClass falls back to the medium class for junk", () => {
  assert.equal(boldnessBadgeClass(undefined), YELLOW);
  assert.equal(boldnessBadgeClass("nonsense"), YELLOW);
});
