import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateCategories } from "./dashboardCategories.ts";

test("counts categories and sorts by frequency, highest first", () => {
  const result = aggregateCategories([
    { category: "Podcast" },
    { category: "Press" },
    { category: "Podcast" },
    { category: "Podcast" },
    { category: "Press" },
  ]);
  assert.deepEqual(result, [
    { name: "Podcast", value: 3 },
    { name: "Press", value: 2 },
  ]);
});

test("coalesces a null category into Uncategorized instead of a 'null' bucket", () => {
  const result = aggregateCategories([
    { category: null },
    { category: "Collab" },
    { category: "Collab" },
  ]);
  assert.deepEqual(result, [
    { name: "Collab", value: 2 },
    { name: "Uncategorized", value: 1 },
  ]);
  // The key must be the readable label, never the string "null".
  assert.ok(!result.some((c) => c.name === "null"));
});

test("coalesces missing and non-string categories into Uncategorized", () => {
  const result = aggregateCategories([
    {},
    { category: undefined },
    { category: 42 },
  ]);
  assert.deepEqual(result, [{ name: "Uncategorized", value: 3 }]);
});

test("treats blank / whitespace-only categories as Uncategorized (no empty label)", () => {
  const result = aggregateCategories([
    { category: "" },
    { category: "   " },
    { category: "Startup" },
  ]);
  assert.deepEqual(result, [
    { name: "Uncategorized", value: 2 },
    { name: "Startup", value: 1 },
  ]);
});

test("trims surrounding whitespace so the same category is not split", () => {
  const result = aggregateCategories([
    { category: "Media" },
    { category: "  Media  " },
  ]);
  assert.deepEqual(result, [{ name: "Media", value: 2 }]);
});

test("returns an empty array for no cards", () => {
  assert.deepEqual(aggregateCategories([]), []);
});
