import { test } from "node:test";
import assert from "node:assert/strict";
import { extractCandidateArray } from "./discoveredEmails.ts";
import { resolveBestEmail } from "./email.ts";

test("returns a bare JSON array unchanged", () => {
  const arr = extractCandidateArray('[{"email":"a@b.com"}]');
  assert.deepEqual(arr, [{ email: "a@b.com" }]);
});

test("unwraps an array wrapped in a 'candidates' object (the original bug)", () => {
  const arr = extractCandidateArray(
    '{"candidates":[{"email":"host@show.com"}]}'
  );
  assert.deepEqual(arr, [{ email: "host@show.com" }]);
});

test("unwraps an array under the 'emails' key", () => {
  const arr = extractCandidateArray('{"emails":[{"email":"x@y.com"}]}');
  assert.deepEqual(arr, [{ email: "x@y.com" }]);
});

test("unwraps an array under an arbitrarily-named key", () => {
  const arr = extractCandidateArray('{"whatever":[{"email":"z@q.com"}]}');
  assert.deepEqual(arr, [{ email: "z@q.com" }]);
});

test("extracts the array from a ```json fenced block", () => {
  const arr = extractCandidateArray(
    '```json\n[{"email":"a@b.com"}]\n```'
  );
  assert.deepEqual(arr, [{ email: "a@b.com" }]);
});

test("extracts the array from surrounding prose", () => {
  const arr = extractCandidateArray(
    'Here are the candidates:\n[{"email":"a@b.com"}]\nHope that helps!'
  );
  assert.deepEqual(arr, [{ email: "a@b.com" }]);
});

test("returns [] for an object with no array property", () => {
  assert.deepEqual(extractCandidateArray('{"email":"a@b.com"}'), []);
});

test("returns [] for empty, whitespace, or non-string input", () => {
  assert.deepEqual(extractCandidateArray(""), []);
  assert.deepEqual(extractCandidateArray("   "), []);
  assert.deepEqual(extractCandidateArray(null), []);
  assert.deepEqual(extractCandidateArray(undefined), []);
});

test("returns [] for unparseable garbage", () => {
  assert.deepEqual(extractCandidateArray("not json at all"), []);
});

test("object-wrapped valid email now resolves as found end-to-end", () => {
  const candidates = extractCandidateArray(
    '{"candidates":[{"email":"real@show.com","confidence":"high"}]}'
  );
  const result = resolveBestEmail(candidates, "");
  assert.equal(result.status, "found");
  assert.equal(result.bestEmail, "real@show.com");
});
