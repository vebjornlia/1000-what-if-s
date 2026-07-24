import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJsonArray } from "./jsonArray.ts";

test("parses a raw JSON array", () => {
  const out = extractJsonArray('[{"email":"a@x.com"},{"email":"b@x.com"}]');
  assert.deepEqual(out, [{ email: "a@x.com" }, { email: "b@x.com" }]);
});

test("recovers the array when the model wraps it in an object", () => {
  const out = extractJsonArray(
    '{"candidates":[{"email":"a@x.com"}],"note":"done"}'
  );
  assert.deepEqual(out, [{ email: "a@x.com" }]);
});

test("extracts an array from surrounding prose", () => {
  const out = extractJsonArray('Here you go: [{"email":"a@x.com"}] — enjoy!');
  assert.deepEqual(out, [{ email: "a@x.com" }]);
});

test("extracts an array from a markdown code fence", () => {
  const out = extractJsonArray('```json\n[{"email":"a@x.com"}]\n```');
  assert.deepEqual(out, [{ email: "a@x.com" }]);
});

test("returns [] for an object with no array property", () => {
  assert.deepEqual(extractJsonArray('{"error":"not found"}'), []);
});

test("returns [] for non-JSON text", () => {
  assert.deepEqual(extractJsonArray("sorry, I could not find any emails"), []);
});

test("returns [] for empty or non-string input", () => {
  assert.deepEqual(extractJsonArray(""), []);
  assert.deepEqual(extractJsonArray("   "), []);
  assert.deepEqual(extractJsonArray(null), []);
  assert.deepEqual(extractJsonArray(undefined), []);
  assert.deepEqual(extractJsonArray(42), []);
});

test("does not throw on malformed JSON-looking input", () => {
  assert.deepEqual(extractJsonArray("[not, valid, json"), []);
});
