import { test } from "node:test";
import assert from "node:assert/strict";
import { getSendableEmail, isEmailAddress } from "./effectiveEmail.ts";

test("prefers the resolved contact when it is a valid email", () => {
  assert.equal(
    getSendableEmail({
      resolved_contact: "host@show.com",
      recipient_contact: "info@show.com",
    }),
    "host@show.com"
  );
});

test("falls back to the original contact when it is a valid email", () => {
  assert.equal(
    getSendableEmail({
      resolved_contact: null,
      recipient_contact: "hello@brand.com",
    }),
    "hello@brand.com"
  );
});

test("returns '' when the only contact is a URL (the bug: URL in Gmail 'to')", () => {
  assert.equal(
    getSendableEmail({
      resolved_contact: null,
      recipient_contact: "https://linkedin.com/in/someone",
    }),
    ""
  );
});

test("returns '' for a social handle contact", () => {
  assert.equal(
    getSendableEmail({ recipient_contact: "@somehandle" }),
    ""
  );
});

test("ignores a blank/whitespace resolved contact and uses the original email", () => {
  assert.equal(
    getSendableEmail({
      resolved_contact: "   ",
      recipient_contact: "real@x.com",
    }),
    "real@x.com"
  );
});

test("trims surrounding whitespace from a valid email", () => {
  assert.equal(
    getSendableEmail({ resolved_contact: "  a@b.com  " }),
    "a@b.com"
  );
});

test("returns '' when there is no contact at all", () => {
  assert.equal(getSendableEmail({}), "");
  assert.equal(
    getSendableEmail({ resolved_contact: null, recipient_contact: null }),
    ""
  );
});

test("isEmailAddress rejects blanks, URLs, and handles; accepts emails", () => {
  assert.equal(isEmailAddress("a@b.com"), true);
  assert.equal(isEmailAddress(""), false);
  assert.equal(isEmailAddress("   "), false);
  assert.equal(isEmailAddress(null), false);
  assert.equal(isEmailAddress(undefined), false);
  assert.equal(isEmailAddress("https://x.com"), false);
  assert.equal(isEmailAddress("@handle"), false);
  assert.equal(isEmailAddress("no-at-sign"), false);
});
