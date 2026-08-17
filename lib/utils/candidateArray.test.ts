import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCandidateArray } from "./candidateArray.ts";

test("returns a bare JSON array unchanged", () => {
  const arr = parseCandidateArray('[{"email":"a@x.com"},{"email":"b@x.com"}]');
  assert.equal(arr.length, 2);
  assert.deepEqual(arr[0], { email: "a@x.com" });
});

test("unwraps an object-wrapped array (the silent-data-loss bug)", () => {
  for (const key of ["candidates", "emails", "results", "items", "data"]) {
    const arr = parseCandidateArray(`{"${key}":[{"email":"host@show.com"}]}`);
    assert.deepEqual(arr, [{ email: "host@show.com" }], `key: ${key}`);
  }
});

test("unwraps the first array-valued property under an unknown key", () => {
  const arr = parseCandidateArray('{"foo":"bar","list":[{"email":"a@x.com"}]}');
  assert.deepEqual(arr, [{ email: "a@x.com" }]);
});

test("extracts an array fenced in markdown", () => {
  const raw = '```json\n[{"email":"a@x.com"}]\n```';
  assert.deepEqual(parseCandidateArray(raw), [{ email: "a@x.com" }]);
});

test("extracts a wrapped array from fenced/prose output", () => {
  const raw = 'Here are the candidates:\n```json\n{"emails":[{"email":"a@x.com"}]}\n```';
  assert.deepEqual(parseCandidateArray(raw), [{ email: "a@x.com" }]);
});

test("returns [] for an object with no array inside", () => {
  assert.deepEqual(parseCandidateArray('{"email":"a@x.com"}'), []);
});

test("returns [] for malformed / non-JSON text", () => {
  for (const bad of ["not json at all", "{", "[oops", "```", ""]) {
    assert.deepEqual(parseCandidateArray(bad), []);
  }
});

test("returns [] for non-string input", () => {
  for (const bad of [null, undefined, 42, {}, []]) {
    assert.deepEqual(parseCandidateArray(bad as unknown), []);
  }
});

test("parses an empty bracket string to an empty array", () => {
  assert.deepEqual(parseCandidateArray("[]"), []);
});
