import { test } from "node:test";
import assert from "node:assert/strict";
import { extractOpportunities } from "./parseOpportunities.ts";

test("parses a clean JSON array (happy path)", () => {
  const result = extractOpportunities('[{"recipient_name":"Ada"}]');
  assert.deepEqual(result, [{ recipient_name: "Ada" }]);
});

test("unwraps an array wrapped in an object (the original bug)", () => {
  const result = extractOpportunities(
    '{"opportunities":[{"recipient_name":"Ada"},{"recipient_name":"Bob"}]}'
  );
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], { recipient_name: "Ada" });
});

test("unwraps regardless of the wrapper key name", () => {
  const result = extractOpportunities('{"what_ifs":[{"emoji":"✨"}]}');
  assert.deepEqual(result, [{ emoji: "✨" }]);
});

test("extracts an array embedded in surrounding prose / code fences", () => {
  const result = extractOpportunities(
    'Here you go:\n```json\n[{"category":"Music"}]\n```\nHope that helps!'
  );
  assert.deepEqual(result, [{ category: "Music" }]);
});

test("returns an empty array for a valid empty array", () => {
  assert.deepEqual(extractOpportunities("[]"), []);
});

test("returns an empty array for an object with no array-valued property", () => {
  assert.deepEqual(extractOpportunities('{"error":"no results"}'), []);
});

test("returns an empty array for unparseable / non-JSON text", () => {
  assert.deepEqual(extractOpportunities("sorry, I could not help"), []);
});

test("returns an empty array for non-string input", () => {
  for (const bad of [null, undefined, 42, {}, ["x"]]) {
    assert.deepEqual(extractOpportunities(bad as unknown), []);
  }
});

test("prefers the top-level array over unwrapping an object", () => {
  // A bare array should be returned as-is, even if it contains objects that
  // themselves have array-valued properties.
  const result = extractOpportunities('[{"tags":["a","b"]}]');
  assert.deepEqual(result, [{ tags: ["a", "b"] }]);
});
