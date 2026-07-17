import { test } from "node:test";
import assert from "node:assert/strict";
import { expireCookie } from "./cookies.ts";

test("expires the named cookie immediately with an empty value", () => {
  const c = expireCookie("x-has-profile");
  assert.ok(c.startsWith("x-has-profile="));
  assert.equal(c.split(";")[0], "x-has-profile="); // value is blank
  assert.match(c, /(^|;\s*)max-age=0(\s*;|\s*$)/);
});

test("defaults to path=/ so it matches a root-scoped cookie", () => {
  assert.match(expireCookie("x-has-profile"), /(^|;\s*)path=\/(\s*;|\s*$)/);
});

test("honors an explicit path", () => {
  assert.equal(expireCookie("sess", "/app"), "sess=; path=/app; max-age=0");
});

test("clears the exact cookie the app sets on sign-in / onboarding", () => {
  // OnboardingFlow and the profile page write `x-has-profile=1; path=/`, so the
  // deletion string must target the same name AND path or the browser keeps it.
  assert.equal(
    expireCookie("x-has-profile"),
    "x-has-profile=; path=/; max-age=0"
  );
});
