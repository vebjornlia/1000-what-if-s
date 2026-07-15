import { test } from "node:test";
import assert from "node:assert/strict";
import { confidenceBadgeClass } from "./confidence.ts";

const HIGH = "bg-green-100 text-green-700";
const MEDIUM = "bg-yellow-100 text-yellow-700";
const LOW = "bg-red-100 text-red-700";

test("maps the canonical lowercase buckets", () => {
  assert.equal(confidenceBadgeClass("high"), HIGH);
  assert.equal(confidenceBadgeClass("medium"), MEDIUM);
  assert.equal(confidenceBadgeClass("low"), LOW);
});

test("normalizes casing from the AI (the original bug)", () => {
  assert.equal(confidenceBadgeClass("High"), HIGH);
  assert.equal(confidenceBadgeClass("LOW"), LOW);
  assert.equal(confidenceBadgeClass("Medium"), MEDIUM);
});

test("normalizes surrounding whitespace", () => {
  assert.equal(confidenceBadgeClass("  high "), HIGH);
  assert.equal(confidenceBadgeClass("\tlow\n"), LOW);
});

test("falls back to the visible neutral (medium) style for unknown words", () => {
  assert.equal(confidenceBadgeClass("moderate"), MEDIUM);
  assert.equal(confidenceBadgeClass("very high"), MEDIUM);
  assert.equal(confidenceBadgeClass(""), MEDIUM);
});

test("falls back to a visible style for non-string values", () => {
  assert.equal(confidenceBadgeClass(undefined), MEDIUM);
  assert.equal(confidenceBadgeClass(null), MEDIUM);
  assert.equal(confidenceBadgeClass(42), MEDIUM);
});

test("never returns an empty/undefined class", () => {
  for (const input of ["high", "HIGH", "weird", "", undefined, null, 0, {}]) {
    const cls = confidenceBadgeClass(input);
    assert.ok(typeof cls === "string" && cls.length > 0);
  }
});
