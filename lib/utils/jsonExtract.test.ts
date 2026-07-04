import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJsonObject } from "./jsonExtract.ts";

test("parses a clean JSON object", () => {
  const result = extractJsonObject('{"display_name":"Ada","boldness_level":"high"}');
  assert.deepEqual(result, { display_name: "Ada", boldness_level: "high" });
});

test("tolerates surrounding whitespace", () => {
  const result = extractJsonObject('   \n {"a":1}\n ');
  assert.deepEqual(result, { a: 1 });
});

test("extracts an object wrapped in markdown code fences", () => {
  const text = '```json\n{"skills":["writing"],"tone":"casual"}\n```';
  assert.deepEqual(extractJsonObject(text), { skills: ["writing"], tone: "casual" });
});

test("extracts an object surrounded by prose", () => {
  const text = 'Sure! Here is the profile:\n{"occupation":"designer"}\nHope that helps.';
  assert.deepEqual(extractJsonObject(text), { occupation: "designer" });
});

test("returns null for a malformed object-shaped substring instead of throwing", () => {
  // This is the original bug: `{...}` matches but is not valid JSON, so the
  // inline `JSON.parse(match[0])` threw and produced a 500.
  const text = "Here you go: {display_name: 'Ada', trailing,}";
  assert.equal(extractJsonObject(text), null);
});

test("returns null when there is no object at all", () => {
  assert.equal(extractJsonObject("I could not build a profile for you."), null);
});

test("returns null for empty or whitespace-only input", () => {
  assert.equal(extractJsonObject(""), null);
  assert.equal(extractJsonObject("   \n\t"), null);
});

test("does not treat a bare array as an object", () => {
  assert.equal(extractJsonObject("[1, 2, 3]"), null);
});

test("does not treat a primitive as an object", () => {
  assert.equal(extractJsonObject('"just a string"'), null);
  assert.equal(extractJsonObject("42"), null);
});

test("returns null for non-string input", () => {
  assert.equal(extractJsonObject(null), null);
  assert.equal(extractJsonObject(undefined), null);
  assert.equal(extractJsonObject({ a: 1 }), null);
});

test("picks the outermost object when nested braces are present", () => {
  const text = 'noise {"a":{"b":2},"c":3} more noise';
  assert.deepEqual(extractJsonObject(text), { a: { b: 2 }, c: 3 });
});
