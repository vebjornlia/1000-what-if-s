import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAuthCallbackUrl } from "./authRedirect.ts";

test("points email links at the /auth/callback route (which exchanges the code)", () => {
  const url = buildAuthCallbackUrl("https://app.example.com");
  assert.equal(url, "https://app.example.com/auth/callback?next=%2Fdeck");
});

test("defaults the post-login destination to /deck", () => {
  const url = buildAuthCallbackUrl("https://app.example.com");
  const next = new URL(url).searchParams.get("next");
  assert.equal(next, "/deck");
});

test("honors a custom next path", () => {
  const url = buildAuthCallbackUrl("https://app.example.com", "/onboarding");
  assert.equal(new URL(url).searchParams.get("next"), "/onboarding");
});

test("strips a trailing slash from the origin so the path is not doubled", () => {
  const url = buildAuthCallbackUrl("https://app.example.com/");
  assert.equal(url, "https://app.example.com/auth/callback?next=%2Fdeck");
});

test("adds a leading slash to a bare next path", () => {
  const url = buildAuthCallbackUrl("https://app.example.com", "deck");
  assert.equal(new URL(url).searchParams.get("next"), "/deck");
});

test("round-trips the next value through the callback's searchParams.get", () => {
  // Mirrors app/auth/callback/route.ts: `searchParams.get("next")`.
  const url = buildAuthCallbackUrl("http://localhost:3000", "/dashboard");
  const decoded = new URL(url).searchParams.get("next");
  assert.equal(decoded, "/dashboard");
});
