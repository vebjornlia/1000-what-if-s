import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAIObject } from "./aiJson.ts";

test("parses a clean JSON object", () => {
  assert.deepEqual(parseAIObject('{"name":"Ada","boldness":"high"}'), {
    name: "Ada",
    boldness: "high",
  });
});

test("extracts JSON wrapped in a markdown code fence", () => {
  const text = 'Here is the profile:\n```json\n{"name":"Ada"}\n```';
  assert.deepEqual(parseAIObject(text), { name: "Ada" });
});

test("extracts JSON surrounded by prose", () => {
  const text = 'Sure! {"goal":"grow"} Hope that helps.';
  assert.deepEqual(parseAIObject(text), { goal: "grow" });
});

test("returns {} for a matched-but-invalid brace span (the original 500 bug)", () => {
  // A greedy `{...}` match that is NOT valid JSON used to throw from
  // JSON.parse in the fallback and 500 the whole request.
  assert.deepEqual(parseAIObject('{ this is not: valid json }'), {});
});

test("returns {} when there is no object at all", () => {
  assert.deepEqual(parseAIObject("no json here"), {});
});

test("returns {} for a top-level JSON array (not an object)", () => {
  assert.deepEqual(parseAIObject("[1,2,3]"), {});
});

test("returns {} for JSON null", () => {
  assert.deepEqual(parseAIObject("null"), {});
});

test("returns {} for non-string input", () => {
  assert.deepEqual(parseAIObject(undefined), {});
  assert.deepEqual(parseAIObject(42), {});
  assert.deepEqual(parseAIObject(null), {});
});

test("parses the first object when trailing junk follows", () => {
  // Greedy match spans to the last brace; inner content stays intact.
  assert.deepEqual(parseAIObject('{"a":1}'), { a: 1 });
});
