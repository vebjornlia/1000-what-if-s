import { test } from "node:test";
import assert from "node:assert/strict";
import { isProtectedPath } from "./protectedPath.ts";

const PROTECTED = ["/onboarding", "/deck", "/queue", "/dashboard", "/profile", "/settings"];

test("matches an exact protected base path", () => {
  assert.equal(isProtectedPath("/deck", PROTECTED), true);
  assert.equal(isProtectedPath("/profile", PROTECTED), true);
});

test("matches sub-routes of a protected base", () => {
  assert.equal(isProtectedPath("/deck/", PROTECTED), true);
  assert.equal(isProtectedPath("/dashboard/stats", PROTECTED), true);
  assert.equal(isProtectedPath("/profile/edit/name", PROTECTED), true);
});

test("does NOT match unrelated routes that merely share a prefix (the bug)", () => {
  // Previously `startsWith` wrongly protected these.
  assert.equal(isProtectedPath("/deckhouse", PROTECTED), false);
  assert.equal(isProtectedPath("/decks-public", PROTECTED), false);
  assert.equal(isProtectedPath("/profiler", PROTECTED), false);
  assert.equal(isProtectedPath("/queued-items", PROTECTED), false);
});

test("leaves genuinely public routes unprotected", () => {
  for (const p of ["/", "/login", "/signup", "/auth/callback"]) {
    assert.equal(isProtectedPath(p, PROTECTED), false);
  }
});

test("returns false when there are no protected paths", () => {
  assert.equal(isProtectedPath("/deck", []), false);
});
