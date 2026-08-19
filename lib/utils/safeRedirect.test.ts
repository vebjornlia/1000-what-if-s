import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./safeRedirect.ts";

test("allows a normal same-origin path", () => {
  assert.equal(safeRedirectPath("/dashboard"), "/dashboard");
  assert.equal(safeRedirectPath("/queue?tab=sent"), "/queue?tab=sent");
  assert.equal(safeRedirectPath("/"), "/");
});

test("falls back when next is missing or empty", () => {
  assert.equal(safeRedirectPath(null), "/onboarding");
  assert.equal(safeRedirectPath(undefined), "/onboarding");
  assert.equal(safeRedirectPath(""), "/onboarding");
});

test("respects a custom fallback", () => {
  assert.equal(safeRedirectPath(null, "/deck"), "/deck");
});

test("rejects targets that escape the origin via concatenation (the bug)", () => {
  // origin has no trailing slash, so these would become off-origin hosts.
  assert.equal(safeRedirectPath("@evil.com"), "/onboarding");
  assert.equal(safeRedirectPath(".evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("evil.com"), "/onboarding");
});

test("rejects protocol-relative and backslash-tricked targets", () => {
  assert.equal(safeRedirectPath("//evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("//evil.com/path"), "/onboarding");
  assert.equal(safeRedirectPath("/\\evil.com"), "/onboarding");
});

test("rejects absolute URLs", () => {
  assert.equal(safeRedirectPath("https://evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("http://evil.com"), "/onboarding");
});
