import { test } from "node:test";
import assert from "node:assert/strict";
import { isProtectedPath } from "./protectedPath.ts";

// Mirrors the list used by the auth middleware.
const PROTECTED = ["/onboarding", "/deck", "/queue", "/dashboard", "/profile", "/settings"];

test("matches an exact protected path", () => {
  assert.equal(isProtectedPath("/deck", PROTECTED), true);
});

test("matches a nested child of a protected path", () => {
  assert.equal(isProtectedPath("/deck/settings", PROTECTED), true);
  assert.equal(isProtectedPath("/dashboard/stats/2024", PROTECTED), true);
});

test("matches a protected path with a trailing slash", () => {
  assert.equal(isProtectedPath("/queue/", PROTECTED), true);
});

test("every protected path guards itself", () => {
  for (const p of PROTECTED) {
    assert.equal(isProtectedPath(p, PROTECTED), true, `${p} should be protected`);
  }
});

test("does NOT match a sibling that only shares a leading substring", () => {
  // The bug a naive startsWith() has: these are distinct routes, not children.
  assert.equal(isProtectedPath("/deckhouse", PROTECTED), false);
  assert.equal(isProtectedPath("/profiles", PROTECTED), false);
  assert.equal(isProtectedPath("/deck-demo", PROTECTED), false);
  assert.equal(isProtectedPath("/settings-help", PROTECTED), false);
});

test("does NOT match unrelated public paths", () => {
  assert.equal(isProtectedPath("/", PROTECTED), false);
  assert.equal(isProtectedPath("/login", PROTECTED), false);
  assert.equal(isProtectedPath("/signup", PROTECTED), false);
  assert.equal(isProtectedPath("/api/generate", PROTECTED), false);
});

test("returns false when no protected paths are configured", () => {
  assert.equal(isProtectedPath("/deck", []), false);
});
