import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./redirect.ts";

test("allows a normal absolute path unchanged", () => {
  assert.equal(safeRedirectPath("/deck"), "/deck");
  assert.equal(safeRedirectPath("/queue?tab=sent"), "/queue?tab=sent");
  assert.equal(safeRedirectPath("/"), "/");
});

test("falls back when next is missing or empty", () => {
  assert.equal(safeRedirectPath(null, "/onboarding"), "/onboarding");
  assert.equal(safeRedirectPath(undefined, "/onboarding"), "/onboarding");
  assert.equal(safeRedirectPath("", "/onboarding"), "/onboarding");
});

test("default fallback is '/'", () => {
  assert.equal(safeRedirectPath(null), "/");
});

test("blocks the userinfo open-redirect (the original bug)", () => {
  // `${origin}${next}` would become https://app.com@evil.com -> evil.com
  assert.equal(safeRedirectPath("@evil.com", "/onboarding"), "/onboarding");
});

test("blocks absolute and protocol-relative URLs", () => {
  assert.equal(safeRedirectPath("https://evil.com", "/x"), "/x");
  assert.equal(safeRedirectPath("http://evil.com", "/x"), "/x");
  assert.equal(safeRedirectPath("//evil.com", "/x"), "/x");
});

test("blocks backslash-tricked hosts", () => {
  assert.equal(safeRedirectPath("/\\evil.com", "/x"), "/x");
});

test("blocks control-character header injection", () => {
  assert.equal(safeRedirectPath("/deck\r\nSet-Cookie: x=1", "/x"), "/x");
  assert.equal(safeRedirectPath("/deck\nfoo", "/x"), "/x");
});

test("non-string input falls back", () => {
  // @ts-expect-error exercising untrusted runtime input
  assert.equal(safeRedirectPath(123, "/x"), "/x");
});
