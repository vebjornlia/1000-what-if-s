import { test } from "node:test";
import assert from "node:assert/strict";
import { isExistingAccountSignup } from "./signup.ts";

test("empty identities array = already-registered email", () => {
  // Supabase's anti-enumeration response: fake user, no identities, no session.
  assert.equal(
    isExistingAccountSignup({ user: { identities: [] } }),
    true
  );
});

test("a genuinely new sign-up has at least one identity", () => {
  assert.equal(
    isExistingAccountSignup({ user: { identities: [{ id: "abc" }] } }),
    false
  );
});

test("missing identities field is not treated as existing (defensive)", () => {
  assert.equal(isExistingAccountSignup({ user: {} }), false);
});

test("null identities is not treated as existing", () => {
  assert.equal(isExistingAccountSignup({ user: { identities: null } }), false);
});

test("null user (e.g. confirmation-disabled new signup returns session only)", () => {
  assert.equal(isExistingAccountSignup({ user: null }), false);
});

test("null or undefined data does not throw and returns false", () => {
  assert.equal(isExistingAccountSignup(null), false);
  assert.equal(isExistingAccountSignup(undefined), false);
});

test("empty identities detected even alongside populated user/session fields", () => {
  // Mirrors the real AuthResponse shape: extra fields must not change the verdict.
  const data = {
    user: { id: "x", email: "taken@example.com", identities: [] },
    session: null,
  };
  assert.equal(isExistingAccountSignup(data), true);
});
