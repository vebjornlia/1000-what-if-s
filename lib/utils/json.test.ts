import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJsonArray } from "./json.ts";

test("parses a clean JSON array", () => {
  assert.deepEqual(parseJsonArray('[{"email":"a@b.com"},{"email":"c@d.com"}]'), [
    { email: "a@b.com" },
    { email: "c@d.com" },
  ]);
});

test("returns an empty array for '[]' (distinct from null)", () => {
  assert.deepEqual(parseJsonArray("[]"), []);
});

test("extracts the array from markdown-fenced output", () => {
  const text = '```json\n[{"x":1}]\n```';
  assert.deepEqual(parseJsonArray(text), [{ x: 1 }]);
});

test("extracts the array from prose-wrapped output", () => {
  const text = 'Sure! Here are the results:\n[{"x":1},{"y":2}]\nHope that helps.';
  assert.deepEqual(parseJsonArray(text), [{ x: 1 }, { y: 2 }]);
});

test("returns null for non-JSON text", () => {
  assert.equal(parseJsonArray("I could not find anything."), null);
});

test("returns null for a JSON object with no array", () => {
  assert.equal(parseJsonArray('{"email":"a@b.com"}'), null);
});

test("returns null for a truncated/malformed array instead of throwing", () => {
  // e.g. the model hit a token limit mid-array — must not throw.
  assert.equal(parseJsonArray('[{"email":"a@b.com"}, {"email": '), null);
});

test("preserves nested structures", () => {
  const result = parseJsonArray('[{"a":[1,2],"b":{"c":3}}]');
  assert.deepEqual(result, [{ a: [1, 2], b: { c: 3 } }]);
});
