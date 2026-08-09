import { test } from "node:test";
import assert from "node:assert/strict";
import { extractEmailCandidates } from "./emailCandidates.ts";

test("passes a bare array straight through", () => {
  const arr = [{ email: "a@x.com" }, { email: "b@x.com" }];
  assert.deepEqual(extractEmailCandidates(arr), arr);
});

test("unwraps an array wrapped under 'candidates' (the original bug)", () => {
  const inner = [{ email: "host@show.com" }];
  assert.deepEqual(
    extractEmailCandidates({ candidates: inner }),
    inner
  );
});

test("unwraps other common wrapper keys", () => {
  for (const key of ["emails", "results", "data", "items"]) {
    const inner = [{ email: `x@${key}.com` }];
    assert.deepEqual(extractEmailCandidates({ [key]: inner }), inner);
  }
});

test("prefers the first wrapper key when several are present", () => {
  const inner = [{ email: "first@x.com" }];
  assert.deepEqual(
    extractEmailCandidates({ candidates: inner, emails: [{ email: "second@x.com" }] }),
    inner
  );
});

test("wraps a single bare candidate object into a one-item list", () => {
  const obj = { email: "solo@x.com", confidence: "high" };
  assert.deepEqual(extractEmailCandidates(obj), [obj]);
});

test("returns an empty array for non-array, non-wrapping input", () => {
  for (const bad of [null, undefined, 42, "a@x.com", true, {}, { nope: [1] }]) {
    assert.deepEqual(extractEmailCandidates(bad as unknown), []);
  }
});

test("ignores a wrapper key whose value is not an array", () => {
  assert.deepEqual(extractEmailCandidates({ candidates: "not-an-array" }), []);
});
