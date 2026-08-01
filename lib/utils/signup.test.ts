import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretSignup } from "./signup.ts";

test("returns 'session' when a real session is present (confirmation disabled)", () => {
  const outcome = interpretSignup({
    user: { identities: [{ id: "1" }] },
    session: { access_token: "abc" },
  });
  assert.equal(outcome.status, "session");
  assert.equal(outcome.message, "");
});

test("returns 'confirm_email' for a new signup that needs email confirmation", () => {
  const outcome = interpretSignup({
    user: { identities: [{ id: "1" }] },
    session: null,
  });
  assert.equal(outcome.status, "confirm_email");
  assert.match(outcome.message, /confirm/i);
});

test("returns 'already_registered' when identities is empty (existing email)", () => {
  const outcome = interpretSignup({
    user: { identities: [] },
    session: null,
  });
  assert.equal(outcome.status, "already_registered");
  assert.match(outcome.message, /already exists/i);
});

test("treats a missing user with no session as needing confirmation", () => {
  const outcome = interpretSignup({ user: null, session: null });
  assert.equal(outcome.status, "confirm_email");
});

test("does not crash on null/undefined data", () => {
  assert.equal(interpretSignup(null).status, "confirm_email");
  assert.equal(interpretSignup(undefined).status, "confirm_email");
});

test("a session wins even if identities happens to be empty", () => {
  const outcome = interpretSignup({
    user: { identities: [] },
    session: { access_token: "abc" },
  });
  assert.equal(outcome.status, "session");
});
