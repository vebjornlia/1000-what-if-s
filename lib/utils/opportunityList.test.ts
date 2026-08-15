import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOpportunityList } from "./opportunityList.ts";

test("returns a bare JSON array unchanged", () => {
  const result = parseOpportunityList('[{"recipient_name":"A"},{"recipient_name":"B"}]');
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], { recipient_name: "A" });
});

test("unwraps an array nested in an object (the original bug)", () => {
  const result = parseOpportunityList('{"opportunities":[{"recipient_name":"A"}]}');
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { recipient_name: "A" });
});

test("prefers the non-empty array when an empty one precedes it", () => {
  const result = parseOpportunityList('{"meta":[],"opportunities":[{"recipient_name":"A"}]}');
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { recipient_name: "A" });
});

test("extracts an array wrapped in markdown code fences", () => {
  const result = parseOpportunityList('```json\n[{"recipient_name":"A"}]\n```');
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { recipient_name: "A" });
});

test("extracts an array from surrounding prose", () => {
  const result = parseOpportunityList('Here you go:\n[{"recipient_name":"A"}]\nHope that helps!');
  assert.equal(result.length, 1);
});

test("extracts a fenced object-wrapped array (fences + wrapper)", () => {
  const result = parseOpportunityList('```json\n{"items":[{"recipient_name":"A"}]}\n```');
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { recipient_name: "A" });
});

test("returns [] for an empty JSON array", () => {
  assert.deepEqual(parseOpportunityList("[]"), []);
});

test("returns [] for empty or whitespace input", () => {
  assert.deepEqual(parseOpportunityList(""), []);
  assert.deepEqual(parseOpportunityList("   \n  "), []);
});

test("returns [] for an object with no array property", () => {
  assert.deepEqual(parseOpportunityList('{"error":"no results"}'), []);
});

test("returns [] for non-JSON garbage", () => {
  assert.deepEqual(parseOpportunityList("sorry, I could not help with that"), []);
});

test("does not throw and returns [] on malformed JSON with brackets", () => {
  assert.deepEqual(parseOpportunityList("[not, valid, json"), []);
});
