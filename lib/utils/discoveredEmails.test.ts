import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEmailCandidates } from "./discoveredEmails.ts";

test("parses a bare JSON array", () => {
  const result = parseEmailCandidates(
    '[{"email":"a@x.com"},{"email":"b@x.com"}]'
  );
  assert.deepEqual(result, [{ email: "a@x.com" }, { email: "b@x.com" }]);
});

test("unwraps an array nested inside an object (the silent-loss bug)", () => {
  // Model returns a valid JSON OBJECT wrapping the array. JSON.parse succeeds,
  // so the naive path would hand a non-array downstream and lose every email.
  const result = parseEmailCandidates(
    '{"candidates":[{"email":"host@show.com"}]}'
  );
  assert.deepEqual(result, [{ email: "host@show.com" }]);
});

test("extracts the array when wrapped in prose / markdown fences", () => {
  const result = parseEmailCandidates(
    'Here are the candidates:\n```json\n[{"email":"c@x.com"}]\n```'
  );
  assert.deepEqual(result, [{ email: "c@x.com" }]);
});

test("returns an empty array for an object with no array value", () => {
  const result = parseEmailCandidates('{"error":"no results"}');
  assert.deepEqual(result, []);
});

test("returns an empty array for unparseable / empty input", () => {
  assert.deepEqual(parseEmailCandidates(""), []);
  assert.deepEqual(parseEmailCandidates("not json at all"), []);
  assert.deepEqual(parseEmailCandidates("[]"), []);
});

test("picks the first array-valued property when several keys exist", () => {
  const result = parseEmailCandidates(
    '{"note":"ok","results":[{"email":"d@x.com"}]}'
  );
  assert.deepEqual(result, [{ email: "d@x.com" }]);
});
