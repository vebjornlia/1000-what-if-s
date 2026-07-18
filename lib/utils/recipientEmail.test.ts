import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmailAddress, initialRecipientEmail } from "./recipientEmail.ts";

test("isEmailAddress accepts a normal email", () => {
  assert.equal(isEmailAddress("hello@example.com"), true);
});

test("isEmailAddress trims surrounding whitespace", () => {
  assert.equal(isEmailAddress("  hello@example.com  "), true);
});

test("isEmailAddress rejects a website URL", () => {
  assert.equal(isEmailAddress("https://example.com/contact"), false);
});

test("isEmailAddress rejects a social URL that contains an @ handle", () => {
  assert.equal(isEmailAddress("https://twitter.com/@someone"), false);
});

test("isEmailAddress rejects blank, non-string, and null", () => {
  assert.equal(isEmailAddress(""), false);
  assert.equal(isEmailAddress("   "), false);
  assert.equal(isEmailAddress(null), false);
  assert.equal(isEmailAddress(undefined), false);
  assert.equal(isEmailAddress(42), false);
});

test("initialRecipientEmail prefers a valid resolved email", () => {
  assert.equal(
    initialRecipientEmail("found@example.com", "hi@other.com"),
    "found@example.com"
  );
});

test("initialRecipientEmail falls back to a valid recipient email", () => {
  assert.equal(
    initialRecipientEmail(null, "hi@other.com"),
    "hi@other.com"
  );
});

test("initialRecipientEmail returns blank when the recipient contact is a URL", () => {
  // The original bug: a card whose only contact is a social/website URL would
  // seed the "To" field with that URL, which then got saved as the recipient.
  assert.equal(
    initialRecipientEmail(null, "https://twitter.com/someone"),
    ""
  );
});

test("initialRecipientEmail returns blank when nothing usable is present", () => {
  assert.equal(initialRecipientEmail(null, null), "");
  assert.equal(initialRecipientEmail("", ""), "");
});

test("initialRecipientEmail trims a valid email before returning it", () => {
  assert.equal(
    initialRecipientEmail("  found@example.com  ", null),
    "found@example.com"
  );
});

test("initialRecipientEmail skips a URL resolved contact for a valid recipient email", () => {
  assert.equal(
    initialRecipientEmail("https://example.com", "real@example.com"),
    "real@example.com"
  );
});
