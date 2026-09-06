import { test } from "node:test";
import assert from "node:assert/strict";
import { boldnessBadge } from "./boldness.ts";

test("exact lowercase levels map to their color", () => {
  assert.equal(boldnessBadge("low").className, "bg-blue-100 text-blue-700");
  assert.equal(boldnessBadge("medium").className, "bg-yellow-100 text-yellow-700");
  assert.equal(boldnessBadge("high").className, "bg-red-100 text-red-700");
});

test("capitalized level still gets the right color (the original bug)", () => {
  const badge = boldnessBadge("High");
  assert.equal(badge.className, "bg-red-100 text-red-700");
  assert.equal(badge.label, "High"); // original casing preserved for display
});

test("surrounding whitespace does not break the color lookup", () => {
  assert.equal(boldnessBadge("  low  ").className, "bg-blue-100 text-blue-700");
  assert.equal(boldnessBadge("  low  ").label, "low");
});

test("missing/empty level defaults to medium", () => {
  for (const v of [undefined, null, "", "   "] as const) {
    const badge = boldnessBadge(v);
    assert.equal(badge.className, "bg-yellow-100 text-yellow-700");
    assert.equal(badge.label, "medium");
  }
});

test("off-vocabulary level keeps its text but uses the medium color", () => {
  const badge = boldnessBadge("very bold");
  assert.equal(badge.label, "very bold");
  assert.equal(badge.className, "bg-yellow-100 text-yellow-700");
});
