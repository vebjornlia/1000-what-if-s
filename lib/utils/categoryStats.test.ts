import { test } from "node:test";
import assert from "node:assert/strict";
import { tallyCategories } from "./categoryStats.ts";

test("counts distinct categories and sorts by count desc", () => {
  const result = tallyCategories([
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

test("merges the same category across AI casing/whitespace variants (the bug)", () => {
  const result = tallyCategories([
    { category: "Podcast" },
    { category: "podcast" },
    { category: " Podcast " },
    { category: "PODCAST" },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].value, 4);
  // First-seen trimmed label is kept as the display name.
  assert.equal(result[0].name, "Podcast");
});

test("collapses blank/whitespace/missing categories into 'Uncategorized'", () => {
  const result = tallyCategories([
    { category: "" },
    { category: "   " },
    { category: null },
    { category: undefined },
    {},
  ]);
  assert.deepEqual(result, [{ name: "Uncategorized", value: 5 }]);
});

test("ties broken by name ascending for a stable order", () => {
  const result = tallyCategories([
    { category: "Startup" },
    { category: "Collab" },
    { category: "Media" },
  ]);
  assert.deepEqual(result, [
    { name: "Collab", value: 1 },
    { name: "Media", value: 1 },
    { name: "Startup", value: 1 },
  ]);
});

test("returns an empty array for no cards", () => {
  assert.deepEqual(tallyCategories([]), []);
});
