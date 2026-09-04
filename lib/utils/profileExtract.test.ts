import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProfile } from "./profileExtract.ts";

test("parses a plain JSON object", () => {
  const result = parseProfile('{"display_name":"Ada","boldness_level":"high"}');
  assert.deepEqual(result, { display_name: "Ada", boldness_level: "high" });
});

test("strips markdown code fences around the JSON", () => {
  const result = parseProfile('```json\n{"display_name":"Ada"}\n```');
  assert.deepEqual(result, { display_name: "Ada" });
});

test("extracts the object when the model adds prose around it", () => {
  const result = parseProfile(
    'Sure! Here is the profile:\n{"display_name":"Ada"}\nHope that helps.'
  );
  assert.deepEqual(result, { display_name: "Ada" });
});

test("unwraps a profile nested under a `profile` key", () => {
  const result = parseProfile('{"profile":{"display_name":"Ada"}}');
  assert.deepEqual(result, { display_name: "Ada" });
});

test("does NOT unwrap when `profile` sits alongside real profile fields", () => {
  const result = parseProfile('{"display_name":"Ada","profile":{"x":1}}');
  assert.deepEqual(result, { display_name: "Ada", profile: { x: 1 } });
});

test("returns {} for malformed output instead of throwing (the original bug)", () => {
  // Contains braces so the regex matches, but the extract is not valid JSON.
  // The old inline parser threw here inside its catch → 500 → blank review screen.
  assert.deepEqual(parseProfile('{"display_name": "Ada", oops'), {});
  assert.deepEqual(parseProfile("total nonsense, no json"), {});
});

test("rejects a top-level array but still recovers an object embedded in it", () => {
  // A profile must be an object: a plain array with no object yields {}.
  assert.deepEqual(parseProfile('["Ada","Bob"]'), {});
  // The greedy fallback still salvages an object nested inside the array,
  // matching the "object embedded in surrounding text" recovery.
  assert.deepEqual(parseProfile('[{"display_name":"Ada"}]'), {
    display_name: "Ada",
  });
});

test("returns {} for non-string input", () => {
  for (const bad of [null, undefined, 42, {}, ["x"]]) {
    assert.deepEqual(parseProfile(bad as unknown), {});
  }
});

test("returns {} for empty or whitespace-only input", () => {
  assert.deepEqual(parseProfile(""), {});
  assert.deepEqual(parseProfile("   \n\t"), {});
});
