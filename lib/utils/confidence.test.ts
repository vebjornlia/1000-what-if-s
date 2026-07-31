import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeConfidence,
  confidenceClass,
  confidenceLabel,
} from "./confidence.ts";

const HIGH = "bg-green-100 text-green-700";
const MEDIUM = "bg-yellow-100 text-yellow-700";
const LOW = "bg-red-100 text-red-700";
const FALLBACK = "bg-gray-100 text-gray-700";

test("normalizeConfidence accepts the exact lowercase levels", () => {
  assert.equal(normalizeConfidence("high"), "high");
  assert.equal(normalizeConfidence("medium"), "medium");
  assert.equal(normalizeConfidence("low"), "low");
});

test("normalizeConfidence handles AI mis-casing and surrounding whitespace", () => {
  assert.equal(normalizeConfidence("High"), "high");
  assert.equal(normalizeConfidence("MEDIUM"), "medium");
  assert.equal(normalizeConfidence("  Low  "), "low");
});

test("normalizeConfidence returns null for unknown or non-string values", () => {
  assert.equal(normalizeConfidence("very high"), null);
  assert.equal(normalizeConfidence(""), null);
  assert.equal(normalizeConfidence(undefined), null);
  assert.equal(normalizeConfidence(null), null);
  assert.equal(normalizeConfidence(3), null);
});

test("confidenceClass maps recognized levels to their badge classes", () => {
  assert.equal(confidenceClass("high"), HIGH);
  assert.equal(confidenceClass("medium"), MEDIUM);
  assert.equal(confidenceClass("low"), LOW);
});

test("confidenceClass normalizes casing before mapping", () => {
  assert.equal(confidenceClass("High"), HIGH);
  assert.equal(confidenceClass(" LOW "), LOW);
});

test("confidenceClass falls back to a visible neutral class for bad values", () => {
  // The original bug: an unrecognized value yielded `undefined`, an empty
  // class, and an invisible badge.
  assert.equal(confidenceClass("uncertain"), FALLBACK);
  assert.equal(confidenceClass(undefined), FALLBACK);
  assert.equal(confidenceClass(null), FALLBACK);
  assert.notEqual(confidenceClass("uncertain"), undefined);
});

test("confidenceLabel returns the normalized level or 'unknown'", () => {
  assert.equal(confidenceLabel("High"), "high");
  assert.equal(confidenceLabel("  medium "), "medium");
  assert.equal(confidenceLabel("weird"), "unknown");
  assert.equal(confidenceLabel(undefined), "unknown");
});
