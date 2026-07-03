import { test } from "node:test";
import assert from "node:assert/strict";
import { parseModelJson } from "./modelJson.ts";

test("parses a clean JSON array", () => {
  assert.deepEqual(parseModelJson('[{"email":"a@b.com"}]'), [
    { email: "a@b.com" },
  ]);
});

test("parses an array wrapped in a ```json markdown fence", () => {
  const text = '```json\n[{"email":"a@b.com"}]\n```';
  assert.deepEqual(parseModelJson(text), [{ email: "a@b.com" }]);
});

test("extracts the array when the model adds surrounding prose", () => {
  const text = 'Here are the candidates:\n[{"email":"a@b.com"}]\nHope that helps!';
  assert.deepEqual(parseModelJson(text), [{ email: "a@b.com" }]);
});

test("returns [] (never throws) on a garbled bracket slice", () => {
  // First parse fails; the regex slice matches but is itself invalid JSON.
  const text = "junk [not, valid, json] more junk";
  assert.deepEqual(parseModelJson(text), []);
});

test("returns [] when there is no array at all", () => {
  assert.deepEqual(parseModelJson("the model refused to answer"), []);
});

test("returns [] for empty input", () => {
  assert.deepEqual(parseModelJson(""), []);
});

test("passes through a valid non-array value for the caller to validate", () => {
  // A bare object is valid JSON: parseModelJson returns it as-is, and callers
  // (resolveBestEmail / the Array.isArray guard) reject non-arrays.
  assert.deepEqual(parseModelJson('{"email":"a@b.com"}'), {
    email: "a@b.com",
  });
});

test("tolerates non-string input defensively", () => {
  assert.deepEqual(parseModelJson(undefined as unknown as string), []);
  assert.deepEqual(parseModelJson(null as unknown as string), []);
});
