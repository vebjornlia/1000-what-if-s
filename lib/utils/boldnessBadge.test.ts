import { test } from "node:test";
import assert from "node:assert/strict";
import { boldnessBadge, BOLDNESS_BADGE_CLASSES } from "./boldnessBadge.ts";

test("maps exact lowercase levels to their color and label", () => {
  for (const key of ["low", "medium", "high"] as const) {
    const badge = boldnessBadge(key);
    assert.equal(badge.key, key);
    assert.equal(badge.label, key);
    assert.equal(badge.className, BOLDNESS_BADGE_CLASSES[key]);
  }
});

test("normalizes case so the color matches the level (the original bug)", () => {
  // "High" previously fell back to the yellow medium color while showing "High".
  const badge = boldnessBadge("High");
  assert.equal(badge.key, "high");
  assert.equal(badge.className, BOLDNESS_BADGE_CLASSES.high);
  assert.equal(badge.label, "High");
});

test("handles all-caps and descriptive variants", () => {
  assert.equal(boldnessBadge("HIGH").key, "high");
  assert.equal(boldnessBadge("very high").key, "high");
  assert.equal(boldnessBadge("  Low  ").key, "low");
  assert.equal(boldnessBadge("Low").label, "Low");
});

test("trims surrounding whitespace on the label", () => {
  assert.equal(boldnessBadge("  high  ").label, "high");
});

test("defaults to medium for missing, blank, or non-string input", () => {
  for (const bad of [undefined, null, "", "   ", 3, {}] as unknown[]) {
    const badge = boldnessBadge(bad);
    assert.equal(badge.key, "medium");
    assert.equal(badge.label, "medium");
    assert.equal(badge.className, BOLDNESS_BADGE_CLASSES.medium);
  }
});

test("falls back to medium color for unrecognized descriptors", () => {
  const badge = boldnessBadge("adventurous");
  assert.equal(badge.key, "medium");
  assert.equal(badge.className, BOLDNESS_BADGE_CLASSES.medium);
  // Preserves the original wording rather than discarding it.
  assert.equal(badge.label, "adventurous");
});
