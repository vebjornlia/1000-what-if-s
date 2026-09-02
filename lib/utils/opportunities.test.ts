import { test } from "node:test";
import assert from "node:assert/strict";
import { extractOpportunities } from "./opportunities.ts";

test("returns a bare array unchanged", () => {
  const arr = [{ recipient_name: "A" }, { recipient_name: "B" }];
  assert.deepEqual(extractOpportunities(arr), arr);
});

test("unwraps an array nested under 'opportunities' (the original bug)", () => {
  const arr = [{ recipient_name: "A" }];
  assert.deepEqual(extractOpportunities({ opportunities: arr }), arr);
});

test("unwraps an array nested under other known keys", () => {
  const arr = [{ recipient_name: "A" }];
  for (const key of ["what_ifs", "cards", "items", "results", "data"]) {
    assert.deepEqual(extractOpportunities({ [key]: arr }), arr, key);
  }
});

test("falls back to the first array-valued property for an unknown key", () => {
  const arr = [{ recipient_name: "A" }];
  assert.deepEqual(extractOpportunities({ note: "hi", list: arr }), arr);
});

test("prefers a known key over an arbitrary array property", () => {
  const known = [{ recipient_name: "known" }];
  const other = [{ recipient_name: "other" }];
  // Object insertion order puts `misc` first, but `opportunities` must win.
  assert.deepEqual(
    extractOpportunities({ misc: other, opportunities: known }),
    known
  );
});

test("returns [] for an empty nested array so the caller fails cleanly", () => {
  assert.deepEqual(extractOpportunities({ opportunities: [] }), []);
});

test("returns [] for non-array, non-object input", () => {
  assert.deepEqual(extractOpportunities(null), []);
  assert.deepEqual(extractOpportunities(undefined), []);
  assert.deepEqual(extractOpportunities("nope"), []);
  assert.deepEqual(extractOpportunities(42), []);
});

test("returns [] for an object with no array-valued property", () => {
  assert.deepEqual(extractOpportunities({ error: "quota exceeded" }), []);
});
