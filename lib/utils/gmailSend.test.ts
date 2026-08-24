import { test } from "node:test";
import assert from "node:assert/strict";
import { isSendableEmail } from "./gmailSend.ts";

test("isSendableEmail accepts a normal email address", () => {
  assert.equal(isSendableEmail("hello@example.com"), true);
  assert.equal(isSendableEmail("first.last@sub.domain.co"), true);
});

test("isSendableEmail trims surrounding whitespace before validating", () => {
  assert.equal(isSendableEmail("  hello@example.com  "), true);
});

test("isSendableEmail rejects an empty/blank contact", () => {
  assert.equal(isSendableEmail(""), false);
  assert.equal(isSendableEmail("   "), false);
});

test("isSendableEmail rejects null/undefined", () => {
  assert.equal(isSendableEmail(null), false);
  assert.equal(isSendableEmail(undefined), false);
});

test("isSendableEmail rejects a non-email URL (e.g. LinkedIn/Twitter link)", () => {
  assert.equal(isSendableEmail("https://linkedin.com/in/someone"), false);
  assert.equal(isSendableEmail("twitter.com/someone"), false);
  assert.equal(isSendableEmail("example.com"), false);
});

test("isSendableEmail rejects malformed emails", () => {
  assert.equal(isSendableEmail("no-at-sign"), false);
  assert.equal(isSendableEmail("missing@domain"), false);
  assert.equal(isSendableEmail("@no-local.com"), false);
  assert.equal(isSendableEmail("spaces in@email.com"), false);
});
