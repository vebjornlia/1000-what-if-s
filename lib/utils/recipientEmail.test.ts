import { test } from "node:test";
import assert from "node:assert/strict";
import { getSendableEmail, isValidRecipientEmail } from "./recipientEmail.ts";

test("isValidRecipientEmail accepts a normal email and trims surrounding space", () => {
  assert.equal(isValidRecipientEmail("host@show.com"), true);
  assert.equal(isValidRecipientEmail("  host@show.com  "), true);
});

test("isValidRecipientEmail rejects URLs, blanks, and non-strings", () => {
  assert.equal(isValidRecipientEmail("https://linkedin.com/in/someone"), false);
  assert.equal(isValidRecipientEmail("@somehandle"), false);
  assert.equal(isValidRecipientEmail("show.com"), false);
  assert.equal(isValidRecipientEmail(""), false);
  assert.equal(isValidRecipientEmail("   "), false);
  assert.equal(isValidRecipientEmail(null), false);
  assert.equal(isValidRecipientEmail(undefined), false);
});

test("getSendableEmail prefers a valid resolved_contact", () => {
  assert.equal(
    getSendableEmail({ resolved_contact: "real@x.com", recipient_contact: "hello@y.com" }),
    "real@x.com"
  );
});

test("getSendableEmail falls back to recipient_contact when resolved is missing", () => {
  assert.equal(
    getSendableEmail({ resolved_contact: null, recipient_contact: "hello@y.com" }),
    "hello@y.com"
  );
});

test("getSendableEmail falls back to recipient_contact when resolved is not an email", () => {
  assert.equal(
    getSendableEmail({
      resolved_contact: "https://not-an-email.com",
      recipient_contact: "hello@y.com",
    }),
    "hello@y.com"
  );
});

test("getSendableEmail returns '' when the only contact is a URL (the lead-loss bug)", () => {
  assert.equal(
    getSendableEmail({ resolved_contact: null, recipient_contact: "https://linkedin.com/in/x" }),
    ""
  );
});

test("getSendableEmail returns '' when there is no contact at all", () => {
  assert.equal(getSendableEmail({ resolved_contact: null, recipient_contact: "" }), "");
  assert.equal(getSendableEmail({}), "");
});

test("getSendableEmail trims a valid but padded email", () => {
  assert.equal(
    getSendableEmail({ resolved_contact: "  real@x.com  ", recipient_contact: null }),
    "real@x.com"
  );
});
