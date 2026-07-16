import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateCategories } from "./categoryStats.ts";

test("counts distinct categories and sorts by count descending", () => {
  const result = aggregateCategories([
    { category: "Media" },
    { category: "Startups" },
    { category: "Startups" },
    { category: "Startups" },
    { category: "Media" },
  ]);
  assert.deepEqual(result, [
    { name: "Startups", value: 3 },
    { name: "Media", value: 2 },
  ]);
});

test("merges inconsistent AI casing/whitespace into one bar (the bug)", () => {
  const result = aggregateCategories([
    { category: "Media" },
    { category: "media" },
    { category: " Media " },
    { category: "MEDIA" },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].value, 4);
  // keeps the first-seen display casing
  assert.equal(result[0].name, "Media");
});

test("buckets missing / blank / whitespace categories as Uncategorized", () => {
  const result = aggregateCategories([
    { category: null },
    { category: undefined },
    { category: "" },
    { category: "   " },
    {},
  ]);
  assert.deepEqual(result, [{ name: "Uncategorized", value: 5 }]);
});

test("keeps real categories separate from the Uncategorized bucket", () => {
  const result = aggregateCategories([
    { category: "Podcasts" },
    { category: null },
    { category: "Podcasts" },
  ]);
  assert.deepEqual(result, [
    { name: "Podcasts", value: 2 },
    { name: "Uncategorized", value: 1 },
  ]);
});

test("returns an empty array for no cards", () => {
  assert.deepEqual(aggregateCategories([]), []);
});
