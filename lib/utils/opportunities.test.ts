import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOpportunities } from "./opportunities.ts";

test("parses a bare JSON array", () => {
  const result = parseOpportunities('[{"recipient_name":"Ada"}]');
  assert.deepEqual(result, [{ recipient_name: "Ada" }]);
});

test("recovers an array wrapped in an object (the original bug)", () => {
  const result = parseOpportunities(
    '{"opportunities":[{"recipient_name":"Ada"},{"recipient_name":"Bo"}]}'
  );
  assert.deepEqual(result, [
    { recipient_name: "Ada" },
    { recipient_name: "Bo" },
  ]);
});

test("recovers the first array-valued property regardless of key name", () => {
  const result = parseOpportunities('{"note":"here you go","items":[1,2,3]}');
  assert.deepEqual(result, [1, 2, 3]);
});

test("strips a ```json markdown code fence around the array", () => {
  const result = parseOpportunities('```json\n[{"a":1}]\n```');
  assert.deepEqual(result, [{ a: 1 }]);
});

test("strips a plain ``` code fence around the array", () => {
  const result = parseOpportunities('```\n[{"a":1}]\n```');
  assert.deepEqual(result, [{ a: 1 }]);
});

test("extracts a bracketed array embedded in surrounding prose", () => {
  const result = parseOpportunities(
    'Here are your opportunities: [{"a":1}] — enjoy!'
  );
  assert.deepEqual(result, [{ a: 1 }]);
});

test("returns an empty array (not null) for a genuinely empty result", () => {
  assert.deepEqual(parseOpportunities("[]"), []);
  assert.deepEqual(parseOpportunities('{"opportunities":[]}'), []);
});

test("returns null when no array structure can be recovered", () => {
  for (const bad of ['{"foo":"bar"}', "not json at all", "42", '"a string"']) {
    assert.equal(parseOpportunities(bad), null);
  }
});

test("returns null for empty, blank, or non-string input", () => {
  for (const bad of ["", "   ", null, undefined, 42, {}, []]) {
    assert.equal(parseOpportunities(bad as unknown), null);
  }
});
