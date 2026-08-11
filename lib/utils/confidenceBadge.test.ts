import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeConfidence,
  confidenceBadgeClass,
  confidenceLabel,
} from "./confidenceBadge.ts";

test("normalizes exact known levels", () => {
  assert.equal(normalizeConfidence("high"), "high");
  assert.equal(normalizeConfidence("medium"), "medium");
  assert.equal(normalizeConfidence("low"), "low");
});

test("normalizes miscased and padded AI values", () => {
  assert.equal(normalizeConfidence("High"), "high");
  assert.equal(normalizeConfidence("  LOW "), "low");
  assert.equal(normalizeConfidence("Medium"), "medium");
});

test("returns null for unknown or non-string values", () => {
  assert.equal(normalizeConfidence("very high"), null);
  assert.equal(normalizeConfidence(""), null);
  assert.equal(normalizeConfidence(undefined), null);
  assert.equal(normalizeConfidence(null), null);
  assert.equal(normalizeConfidence(3), null);
});

test("badge class is always a concrete non-empty class", () => {
  assert.equal(confidenceBadgeClass("high"), "bg-green-100 text-green-700");
  assert.equal(confidenceBadgeClass("High"), "bg-green-100 text-green-700");
  assert.equal(confidenceBadgeClass("low"), "bg-red-100 text-red-700");
  // The original bug: an unrecognized value must NOT yield undefined.
  const unknown = confidenceBadgeClass("bogus");
  assert.equal(typeof unknown, "string");
  assert.ok(unknown.length > 0);
  assert.equal(confidenceBadgeClass(undefined), "bg-gray-100 text-gray-700");
});

test("label normalizes known values and reads 'unknown' otherwise", () => {
  assert.equal(confidenceLabel("High"), "high");
  assert.equal(confidenceLabel("  LOW "), "low");
  assert.equal(confidenceLabel("bogus"), "unknown");
  assert.equal(confidenceLabel(undefined), "unknown");
});
