import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeRedirectPath } from "./redirect.ts";

test("passes through a normal rooted path", () => {
  assert.equal(sanitizeRedirectPath("/deck"), "/deck");
  assert.equal(sanitizeRedirectPath("/onboarding"), "/onboarding");
});

test("keeps the query string on a rooted path", () => {
  assert.equal(
    sanitizeRedirectPath("/deck?generate=true"),
    "/deck?generate=true"
  );
});

test("trims surrounding whitespace around a valid path", () => {
  assert.equal(sanitizeRedirectPath("  /deck  "), "/deck");
});

test("falls back when next is missing or blank", () => {
  assert.equal(sanitizeRedirectPath(null), "/onboarding");
  assert.equal(sanitizeRedirectPath(undefined), "/onboarding");
  assert.equal(sanitizeRedirectPath(""), "/onboarding");
  assert.equal(sanitizeRedirectPath("   "), "/onboarding");
});

test("rejects absolute URLs (open-redirect attempt)", () => {
  assert.equal(sanitizeRedirectPath("https://evil.com"), "/onboarding");
  assert.equal(sanitizeRedirectPath("http://evil.com/path"), "/onboarding");
  assert.equal(sanitizeRedirectPath("javascript:alert(1)"), "/onboarding");
});

test("rejects protocol-relative and backslash-obfuscated targets", () => {
  assert.equal(sanitizeRedirectPath("//evil.com"), "/onboarding");
  assert.equal(sanitizeRedirectPath("/\\evil.com"), "/onboarding");
  assert.equal(sanitizeRedirectPath("/\\/evil.com"), "/onboarding");
});

test("rejects paths with embedded control characters (header injection)", () => {
  assert.equal(sanitizeRedirectPath("/deck\nSet-Cookie: x=1"), "/onboarding");
  assert.equal(sanitizeRedirectPath("/de\r\nck"), "/onboarding");
  assert.equal(
    sanitizeRedirectPath("/deck" + String.fromCharCode(0)),
    "/onboarding"
  );
});

test("trims a harmless trailing newline to a safe path", () => {
  // trim() strips trailing CR/LF, leaving a clean rooted path.
  assert.equal(sanitizeRedirectPath("/deck\r\n"), "/deck");
});

test("rejects non-string input", () => {
  for (const bad of [42, {}, [], true]) {
    assert.equal(sanitizeRedirectPath(bad as unknown), "/onboarding");
  }
});

test("honours a custom fallback", () => {
  assert.equal(sanitizeRedirectPath("//evil.com", "/deck"), "/deck");
  assert.equal(sanitizeRedirectPath(null, "/"), "/");
});
