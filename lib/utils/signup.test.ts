import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretSignUp, SIGNUP_CONFIRM_MESSAGE } from "./signup.ts";

test("live session → logged in, no message", () => {
  const outcome = interpretSignUp({ access_token: "abc", user: { id: "1" } });
  assert.equal(outcome.loggedIn, true);
  assert.equal(outcome.message, null);
});

test("null session (email confirmation required) → not logged in, shows message", () => {
  const outcome = interpretSignUp(null);
  assert.equal(outcome.loggedIn, false);
  assert.equal(outcome.message, SIGNUP_CONFIRM_MESSAGE);
});

test("undefined session → treated as confirmation required", () => {
  const outcome = interpretSignUp(undefined);
  assert.equal(outcome.loggedIn, false);
  assert.equal(outcome.message, SIGNUP_CONFIRM_MESSAGE);
});

test("confirmation message keeps the login page's teal-styling prefix", () => {
  // The login/signup UI colors a message teal only when it includes this text.
  assert.ok(SIGNUP_CONFIRM_MESSAGE.includes("Check your email"));
});
