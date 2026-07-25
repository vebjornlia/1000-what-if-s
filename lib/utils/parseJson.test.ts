import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJsonObject } from "./parseJson.ts";

test("parses a plain JSON object", () => {
  assert.deepEqual(parseJsonObject('{"name":"Ada","boldness":"high"}'), {
    name: "Ada",
    boldness: "high",
  });
});

test("extracts a JSON object wrapped in prose", () => {
  const text = 'Here is the profile you asked for: {"name":"Ada"} — hope it helps!';
  assert.deepEqual(parseJsonObject(text), { name: "Ada" });
});

test("extracts a JSON object wrapped in a markdown code fence", () => {
  const text = '```json\n{"name":"Ada"}\n```';
  assert.deepEqual(parseJsonObject(text), { name: "Ada" });
});

test("returns {} for malformed JSON instead of throwing (the original bug)", () => {
  // Unquoted keys are a common model mistake; the greedy `{...}` span matches
  // but JSON.parse fails. Must degrade to {} rather than throw a 500.
  assert.doesNotThrow(() => parseJsonObject("prefix {name: Ada, boldness: high} suffix"));
  assert.deepEqual(parseJsonObject("prefix {name: Ada} suffix"), {});
});

test("returns {} for text with no object span", () => {
  assert.deepEqual(parseJsonObject("I could not build a profile."), {});
});

test("a bare JSON array is not itself an object, but a wrapped object is recovered", () => {
  // Direct parse yields an array (rejected), so span extraction recovers the
  // first `{ ... }` object inside it — better than discarding the data.
  assert.deepEqual(parseJsonObject('[{"name":"Ada"}]'), { name: "Ada" });
  // An array with no object span has nothing to recover, so it coalesces to {}.
  assert.deepEqual(parseJsonObject('["a","b"]'), {});
});

test("coalesces non-object JSON scalars to {}", () => {
  assert.deepEqual(parseJsonObject('"just a string"'), {});
  assert.deepEqual(parseJsonObject("42"), {});
  assert.deepEqual(parseJsonObject("null"), {});
});

test("returns {} for empty, whitespace, or non-string input", () => {
  assert.deepEqual(parseJsonObject(""), {});
  assert.deepEqual(parseJsonObject("   \n  "), {});
  assert.deepEqual(parseJsonObject(undefined), {});
  assert.deepEqual(parseJsonObject(null), {});
});

test("keeps the outermost object when nested braces are present", () => {
  const text = 'noise {"profile":{"name":"Ada"},"tags":["a","b"]} trailing';
  assert.deepEqual(parseJsonObject(text), {
    profile: { name: "Ada" },
    tags: ["a", "b"],
  });
});
