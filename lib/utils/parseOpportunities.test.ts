import { test } from "node:test";
import assert from "node:assert/strict";
import { extractOpportunities } from "./parseOpportunities.ts";

test("parses a clean JSON array", () => {
  const result = extractOpportunities('[{"recipient_name":"Ada"}]');
  assert.deepEqual(result, [{ recipient_name: "Ada" }]);
});

test("recovers an array wrapped in an object (the original bug)", () => {
  // Valid JSON, but an object — a plain JSON.parse would pass the guard and 500.
  const result = extractOpportunities(
    '{"opportunities":[{"recipient_name":"Ada"},{"recipient_name":"Grace"}]}'
  );
  assert.equal(result.length, 2);
  assert.deepEqual(result, [
    { recipient_name: "Ada" },
    { recipient_name: "Grace" },
  ]);
});

test("recovers an array under any object key, not just 'opportunities'", () => {
  const result = extractOpportunities('{"data":[{"recipient_name":"Ada"}]}');
  assert.deepEqual(result, [{ recipient_name: "Ada" }]);
});

test("recovers an array from a markdown code fence", () => {
  const result = extractOpportunities(
    '```json\n[{"recipient_name":"Ada"}]\n```'
  );
  assert.deepEqual(result, [{ recipient_name: "Ada" }]);
});

test("recovers an array embedded in surrounding prose", () => {
  const result = extractOpportunities(
    'Sure! Here are your opportunities: [{"recipient_name":"Ada"}] — enjoy.'
  );
  assert.deepEqual(result, [{ recipient_name: "Ada" }]);
});

test("returns [] for a JSON object with no array inside", () => {
  assert.deepEqual(extractOpportunities('{"error":"nope"}'), []);
});

test("returns [] for unparseable / empty / non-string input", () => {
  assert.deepEqual(extractOpportunities("not json at all"), []);
  assert.deepEqual(extractOpportunities(""), []);
  assert.deepEqual(extractOpportunities(undefined), []);
  assert.deepEqual(extractOpportunities(null), []);
});

test("returns an empty array as-is (caller decides it's 'no opportunities')", () => {
  assert.deepEqual(extractOpportunities("[]"), []);
});
