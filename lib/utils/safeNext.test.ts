import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "./safeNext.ts";

test("allows a normal absolute path", () => {
  assert.equal(safeNextPath("/deck"), "/deck");
});

test("allows an absolute path with a query string", () => {
  assert.equal(safeNextPath("/queue?generate=true"), "/queue?generate=true");
});

test("falls back to default when next is missing", () => {
  assert.equal(safeNextPath(null), "/onboarding");
  assert.equal(safeNextPath(undefined), "/onboarding");
  assert.equal(safeNextPath(""), "/onboarding");
});

test("honors a custom fallback", () => {
  assert.equal(safeNextPath(null, "/dashboard"), "/dashboard");
});

// The open-redirect cases: each of these, once concatenated onto our origin,
// resolves to an external (attacker) host. They must NOT be allowed through.
test("rejects userinfo trick that escapes the origin (@evil.com)", () => {
  // `https://myapp.com` + `@evil.com` -> host becomes evil.com
  assert.equal(safeNextPath("@evil.com"), "/onboarding");
});

test("rejects sibling-domain trick (.evil.com)", () => {
  // `https://myapp.com` + `.evil.com` -> host becomes myapp.com.evil.com
  assert.equal(safeNextPath(".evil.com"), "/onboarding");
});

test("rejects a fully-qualified external URL", () => {
  assert.equal(safeNextPath("https://evil.com"), "/onboarding");
});

test("rejects protocol-relative URLs", () => {
  assert.equal(safeNextPath("//evil.com"), "/onboarding");
});

test("rejects backslash-normalized URLs", () => {
  assert.equal(safeNextPath("/\\evil.com"), "/onboarding");
});

test("rejects paths containing control characters", () => {
  assert.equal(safeNextPath("/deck\nSet-Cookie: x=1"), "/onboarding");
});
