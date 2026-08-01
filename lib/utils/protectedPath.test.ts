import { test } from "node:test";
import assert from "node:assert/strict";
import { isProtectedPath } from "./protectedPath.ts";

// The real list guarded by the auth middleware.
const PROTECTED = [
  "/onboarding",
  "/deck",
  "/queue",
  "/dashboard",
  "/profile",
  "/settings",
];

test("matches a protected section exactly", () => {
  for (const p of PROTECTED) {
    assert.equal(isProtectedPath(p, PROTECTED), true, p);
  }
});

test("matches nested routes under a protected section", () => {
  assert.equal(isProtectedPath("/deck/generate", PROTECTED), true);
  assert.equal(isProtectedPath("/profile/edit", PROTECTED), true);
  assert.equal(isProtectedPath("/dashboard/stats/weekly", PROTECTED), true);
});

test("does NOT match look-alike routes that only share a prefix (the bug)", () => {
  // These would be wrongly treated as protected by a raw startsWith check.
  assert.equal(isProtectedPath("/decks", PROTECTED), false);
  assert.equal(isProtectedPath("/dashboard-preview", PROTECTED), false);
  assert.equal(isProtectedPath("/profiles", PROTECTED), false);
  assert.equal(isProtectedPath("/settings-help", PROTECTED), false);
});

test("does not match unrelated public routes", () => {
  for (const p of ["/", "/login", "/signup", "/about", "/pricing"]) {
    assert.equal(isProtectedPath(p, PROTECTED), false, p);
  }
});

test("treats a trailing slash on the section root as protected", () => {
  assert.equal(isProtectedPath("/deck/", PROTECTED), true);
});

test("returns false for an empty protected list", () => {
  assert.equal(isProtectedPath("/deck", []), false);
});
