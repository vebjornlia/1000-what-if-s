import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretSignupResult } from "./signupResult.ts";

test("returns 'confirmed' when a session is present", () => {
  assert.equal(
    interpretSignupResult({ session: { access_token: "abc" }, user: { identities: [{ id: "1" }] } }),
    "confirmed"
  );
});

test("returns 'needs_confirmation' for a fresh signup with a user but no session", () => {
  assert.equal(
    interpretSignupResult({ session: null, user: { identities: [{ id: "1" }] } }),
    "needs_confirmation"
  );
});

test("returns 'already_registered' when identities is empty and no session", () => {
  assert.equal(
    interpretSignupResult({ session: null, user: { identities: [] } }),
    "already_registered"
  );
});

test("a session outranks an empty identities array", () => {
  assert.equal(
    interpretSignupResult({ session: { access_token: "abc" }, user: { identities: [] } }),
    "confirmed"
  );
});

test("defaults to 'needs_confirmation' for a null/empty or malformed response", () => {
  assert.equal(interpretSignupResult(null), "needs_confirmation");
  assert.equal(interpretSignupResult(undefined), "needs_confirmation");
  assert.equal(interpretSignupResult({}), "needs_confirmation");
  assert.equal(interpretSignupResult({ user: null, session: null }), "needs_confirmation");
});

test("ignores a non-array identities value", () => {
  assert.equal(
    interpretSignupResult({ session: null, user: { identities: "nope" } }),
    "needs_confirmation"
  );
});
