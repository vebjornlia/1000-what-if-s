import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./redirect.ts";

test("allows a plain in-app relative path", () => {
  assert.equal(safeRedirectPath("/deck"), "/deck");
  assert.equal(safeRedirectPath("/queue?x=1#top"), "/queue?x=1#top");
});

test("blocks the userinfo open-redirect (the core bug)", () => {
  // `${origin}${next}` => "https://app.com@evil.com" whose host is evil.com.
  assert.equal(safeRedirectPath("@evil.com"), "/onboarding");
});

test("blocks protocol-relative targets", () => {
  assert.equal(safeRedirectPath("//evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("//evil.com/path"), "/onboarding");
});

test("blocks absolute URLs with a scheme", () => {
  assert.equal(safeRedirectPath("https://evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("http://evil.com/onboarding"), "/onboarding");
});

test("blocks backslash-obfuscated origin escapes", () => {
  assert.equal(safeRedirectPath("/\\evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("\\\\evil.com"), "/onboarding");
});

test("blocks control-character injection", () => {
  assert.equal(safeRedirectPath("/deck\nSet-Cookie: x=1"), "/onboarding");
});

test("blocks paths that are not rooted at a slash", () => {
  assert.equal(safeRedirectPath("evil.com"), "/onboarding");
  assert.equal(safeRedirectPath("javascript:alert(1)"), "/onboarding");
});

test("trims surrounding whitespace before validating", () => {
  assert.equal(safeRedirectPath("  /deck  "), "/deck");
  assert.equal(safeRedirectPath("  //evil.com"), "/onboarding");
});

test("falls back for missing or non-string input", () => {
  assert.equal(safeRedirectPath(null), "/onboarding");
  assert.equal(safeRedirectPath(undefined), "/onboarding");
  assert.equal(safeRedirectPath(42 as unknown), "/onboarding");
});

test("honors a custom fallback", () => {
  assert.equal(safeRedirectPath("@evil.com", "/deck"), "/deck");
});
