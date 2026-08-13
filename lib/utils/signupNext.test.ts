import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSignupNext } from "./signupNext.ts";

test("redirects when a session is returned (confirmation disabled)", () => {
  const next = resolveSignupNext({ session: { access_token: "abc" } });
  assert.deepEqual(next, { kind: "redirect" });
});

test("asks to confirm when session is null (confirmation required)", () => {
  const next = resolveSignupNext({ session: null });
  assert.deepEqual(next, { kind: "confirm" });
});

test("asks to confirm when session key is absent", () => {
  const next = resolveSignupNext({});
  assert.deepEqual(next, { kind: "confirm" });
});

test("asks to confirm for already-registered email (no session)", () => {
  // Supabase returns a user with empty identities and no session in this case.
  const next = resolveSignupNext({ session: null });
  assert.deepEqual(next, { kind: "confirm" });
});

test("asks to confirm when data is null or undefined", () => {
  assert.deepEqual(resolveSignupNext(null), { kind: "confirm" });
  assert.deepEqual(resolveSignupNext(undefined), { kind: "confirm" });
});
