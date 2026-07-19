import { test } from "node:test";
import assert from "node:assert/strict";
import { boldnessClass } from "./boldness.ts";

const LOW = "bg-blue-100 text-blue-700";
const MEDIUM = "bg-yellow-100 text-yellow-700";
const HIGH = "bg-red-100 text-red-700";

test("maps canonical lowercase levels to their colors", () => {
  assert.equal(boldnessClass("low"), LOW);
  assert.equal(boldnessClass("medium"), MEDIUM);
  assert.equal(boldnessClass("high"), HIGH);
});

test("tolerates casing so a bold profile gets the red badge (the original bug)", () => {
  assert.equal(boldnessClass("High"), HIGH);
  assert.equal(boldnessClass("HIGH"), HIGH);
  assert.equal(boldnessClass("Low"), LOW);
});

test("tolerates surrounding whitespace", () => {
  assert.equal(boldnessClass("  high  "), HIGH);
  assert.equal(boldnessClass("\tlow\n"), LOW);
});

test("falls back to medium for unknown, empty, or non-string values", () => {
  assert.equal(boldnessClass("very high"), MEDIUM);
  assert.equal(boldnessClass(""), MEDIUM);
  assert.equal(boldnessClass("   "), MEDIUM);
  assert.equal(boldnessClass(undefined), MEDIUM);
  assert.equal(boldnessClass(null), MEDIUM);
  assert.equal(boldnessClass(3), MEDIUM);
});
