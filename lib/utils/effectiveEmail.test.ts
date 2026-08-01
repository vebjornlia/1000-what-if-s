import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveEmail, isEmailAddress } from "./effectiveEmail.ts";

test("prefers resolved_contact when it is a valid email", () => {
  assert.equal(
    effectiveEmail({ resolved_contact: "host@show.com", recipient_contact: "someone@x.com" }),
    "host@show.com"
  );
});

test("falls back to recipient_contact when resolved_contact is missing", () => {
  assert.equal(
    effectiveEmail({ resolved_contact: null, recipient_contact: "reach@x.com" }),
    "reach@x.com"
  );
});

test("ignores a non-email recipient_contact URL (the bug)", () => {
  for (const url of [
    "https://example.com",
    "example.com/contact",
    "@somehandle",
    "call 555-1234",
  ]) {
    assert.equal(
      effectiveEmail({ resolved_contact: null, recipient_contact: url }),
      "",
      `expected "" for non-email contact: ${url}`
    );
  }
});

test("skips an invalid resolved_contact and uses a valid recipient_contact", () => {
  assert.equal(
    effectiveEmail({ resolved_contact: "not-an-email", recipient_contact: "real@x.com" }),
    "real@x.com"
  );
});

test("returns empty string when neither field is a valid email", () => {
  assert.equal(effectiveEmail({ resolved_contact: null, recipient_contact: "" }), "");
  assert.equal(effectiveEmail({}), "");
});

test("trims surrounding whitespace on the chosen email", () => {
  assert.equal(
    effectiveEmail({ resolved_contact: "  spaced@x.com  ", recipient_contact: null }),
    "spaced@x.com"
  );
});

test("isEmailAddress validates basic shape and rejects junk", () => {
  assert.equal(isEmailAddress("a@b.co"), true);
  for (const bad of ["", "   ", "no-at", "a@b", "a@b@c.com", null, undefined, 42, {}]) {
    assert.equal(isEmailAddress(bad as unknown), false, `expected false for ${String(bad)}`);
  }
});
