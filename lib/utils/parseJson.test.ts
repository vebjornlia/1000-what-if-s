import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJsonObject } from "./parseJson.ts";

test("parses a clean JSON object", () => {
  assert.deepEqual(parseJsonObject('{"display_name":"Ada"}'), {
    display_name: "Ada",
  });
});

test("recovers an object wrapped in a markdown code fence", () => {
  const text = '```json\n{"display_name":"Ada","tone":"warm"}\n```';
  assert.deepEqual(parseJsonObject(text), {
    display_name: "Ada",
    tone: "warm",
  });
});

test("recovers an object surrounded by prose", () => {
  const text = 'Sure! Here is the profile:\n{"display_name":"Ada"}\nHope that helps.';
  assert.deepEqual(parseJsonObject(text), { display_name: "Ada" });
});

test("returns null for malformed JSON instead of throwing (the original bug)", () => {
  // Previously the route did JSON.parse(match[0]) here, which threw and 500'd,
  // bouncing the user out of onboarding. It must degrade to null.
  const text = "Here is your profile: {display_name: Ada, oops"; // no closing brace
  assert.equal(parseJsonObject(text), null);
});

test("returns null when a `{` opens but the JSON is invalid", () => {
  assert.equal(parseJsonObject("{not valid json at all}"), null);
});

test("returns null for a primitive JSON array (no object to recover)", () => {
  assert.equal(parseJsonObject("[1, 2, 3]"), null);
});

test("recovers the inner object when the model wraps it in a single-element array", () => {
  // Top-level parse yields an array (rejected), but the `{ ... }` fallback
  // still recovers the profile object — better than discarding it.
  assert.deepEqual(parseJsonObject('[{"display_name":"Ada"}]'), {
    display_name: "Ada",
  });
});

test("returns null for JSON primitives and null", () => {
  for (const prim of ['"just a string"', "42", "true", "null"]) {
    assert.equal(parseJsonObject(prim), null);
  }
});

test("returns null for non-string input", () => {
  for (const bad of [null, undefined, 42, {}, ["x"]]) {
    assert.equal(parseJsonObject(bad), null);
  }
});

test("returns an empty object for `{}`", () => {
  assert.deepEqual(parseJsonObject("{}"), {});
});
