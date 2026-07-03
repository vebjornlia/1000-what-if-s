import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveBestEmail,
  getMessageSubject,
  formatMessageForCopy,
} from "./email.ts";

test("returns the first valid candidate as found", () => {
  const result = resolveBestEmail(
    [
      { email: "host@show.com", confidence: "high" },
      { email: "info@show.com", confidence: "low" },
    ],
    "fallback@x.com"
  );
  assert.equal(result.status, "found");
  assert.equal(result.bestEmail, "host@show.com");
  assert.equal(result.validCandidates.length, 2);
});

test("skips leading invalid entries and picks the first VALID email", () => {
  const result = resolveBestEmail(
    [{ email: "" }, { email: "not-an-email" }, { email: "real@x.com" }],
    "fallback@x.com"
  );
  assert.equal(result.status, "found");
  assert.equal(result.bestEmail, "real@x.com");
  assert.equal(result.validCandidates.length, 1);
});

test("a non-empty array with no usable email is NOT found (the original bug)", () => {
  const result = resolveBestEmail(
    [{ reasoning: "no email field" }, { email: "   " }],
    "fallback@x.com"
  );
  assert.equal(result.status, "not_found");
  assert.equal(result.bestEmail, "fallback@x.com");
  assert.deepEqual(result.validCandidates, []);
});

test("falls back to empty string when fallback contact is missing", () => {
  const result = resolveBestEmail([], "");
  assert.equal(result.status, "not_found");
  assert.equal(result.bestEmail, "");
});

test("tolerates non-array input from the model", () => {
  for (const bad of [null, undefined, "[]", { email: "x@y.com" }, 42]) {
    const result = resolveBestEmail(bad as unknown, "fallback@x.com");
    assert.equal(result.status, "not_found");
    assert.equal(result.bestEmail, "fallback@x.com");
  }
});

test("trims surrounding whitespace on the chosen email", () => {
  const result = resolveBestEmail([{ email: "  spaced@x.com  " }]);
  assert.equal(result.bestEmail, "spaced@x.com");
});

test("getMessageSubject uses the provided subject when present", () => {
  assert.equal(
    getMessageSubject({ recipient_name: "Ada", message_subject: "Hello there" }),
    "Hello there"
  );
});

test("getMessageSubject trims surrounding whitespace on the subject", () => {
  assert.equal(
    getMessageSubject({ recipient_name: "Ada", message_subject: "  Hello  " }),
    "Hello"
  );
});

test("getMessageSubject falls back to default for a missing subject", () => {
  assert.equal(
    getMessageSubject({ recipient_name: "Ada" }),
    "Quick question for Ada"
  );
});

test("getMessageSubject falls back to default for a blank/whitespace subject", () => {
  for (const blank of ["", "   ", "\n\t"]) {
    assert.equal(
      getMessageSubject({ recipient_name: "Ada", message_subject: blank }),
      "Quick question for Ada"
    );
  }
});

test("formatMessageForCopy keeps a real subject and appends the body", () => {
  assert.equal(
    formatMessageForCopy({
      recipient_name: "Ada",
      message_subject: "Hello there",
      message_body: "Let's chat.",
    }),
    "Subject: Hello there\n\nLet's chat."
  );
});

test("formatMessageForCopy trims a padded subject", () => {
  assert.equal(
    formatMessageForCopy({
      recipient_name: "Ada",
      message_subject: "  Hello  ",
      message_body: "Body.",
    }),
    "Subject: Hello\n\nBody."
  );
});

test("formatMessageForCopy uses the default subject for a blank/whitespace subject (the original bug: a blank subject line was leaked)", () => {
  for (const blank of ["", "   ", "\n\t", undefined]) {
    assert.equal(
      formatMessageForCopy({
        recipient_name: "Ada",
        message_subject: blank,
        message_body: "Body.",
      }),
      "Subject: Quick question for Ada\n\nBody."
    );
  }
});
