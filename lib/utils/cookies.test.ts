import { test } from "node:test";
import assert from "node:assert/strict";
import { expireCookie } from "./cookies.ts";

test("expireCookie deletes the named cookie with a root path by default", () => {
  assert.equal(expireCookie("x-has-profile"), "x-has-profile=; path=/; max-age=0");
});

test("expireCookie always sets max-age=0 so the browser drops the cookie", () => {
  const result = expireCookie("session");
  assert.match(result, /(^|;\s*)max-age=0(\s*;|$)/);
});

test("expireCookie clears the value (empty after the '=')", () => {
  const result = expireCookie("token");
  assert.equal(result.startsWith("token=;"), true);
});

test("expireCookie honors a custom path so it can match a scoped cookie", () => {
  assert.equal(
    expireCookie("scoped", "/app"),
    "scoped=; path=/app; max-age=0"
  );
});

test("expireCookie matches the existing inline convention used elsewhere in the app", () => {
  // app/(app)/profile/page.tsx expires the same cookie with this exact string.
  assert.equal(expireCookie("x-has-profile"), "x-has-profile=; path=/; max-age=0");
});
