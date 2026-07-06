import { test } from "node:test";
import assert from "node:assert/strict";
import { copyResponseCookies } from "./cookies.ts";

// Minimal stand-in for a NextResponse cookie store: it records set cookies in
// insertion order and can list them back, matching the getAll()/set() surface
// copyResponseCookies relies on.
interface Cookie {
  name: string;
  value: string;
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
}

function makeStore(initial: Cookie[] = []) {
  const cookies = [...initial];
  return {
    getAll: () => [...cookies],
    set: (c: Cookie) => {
      cookies.push(c);
    },
    // test-only accessor
    _cookies: cookies,
  };
}

test("copies every cookie from source onto target", () => {
  const source = makeStore([
    { name: "sb-access-token", value: "abc" },
    { name: "sb-refresh-token", value: "def" },
  ]);
  const target = makeStore();

  copyResponseCookies(source, target);

  assert.equal(target._cookies.length, 2);
  assert.deepEqual(
    target._cookies.map((c) => c.name),
    ["sb-access-token", "sb-refresh-token"]
  );
});

test("preserves cookie options (path/maxAge/httpOnly), not just name+value", () => {
  const source = makeStore([
    { name: "sb-access-token", value: "abc", path: "/", maxAge: 3600, httpOnly: true },
  ]);
  const target = makeStore();

  copyResponseCookies(source, target);

  assert.deepEqual(target._cookies[0], {
    name: "sb-access-token",
    value: "abc",
    path: "/",
    maxAge: 3600,
    httpOnly: true,
  });
});

test("is a no-op when source has no cookies (harmless on redirects)", () => {
  const target = makeStore([{ name: "existing", value: "1" }]);

  copyResponseCookies(makeStore(), target);

  assert.equal(target._cookies.length, 1);
  assert.equal(target._cookies[0].name, "existing");
});

test("does not clobber existing target cookies; appends", () => {
  const source = makeStore([{ name: "sb-refresh-token", value: "new" }]);
  const target = makeStore([{ name: "other", value: "keep" }]);

  copyResponseCookies(source, target);

  assert.deepEqual(
    target._cookies.map((c) => c.name),
    ["other", "sb-refresh-token"]
  );
});
