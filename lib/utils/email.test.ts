import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveBestEmail, getMessageSubject } from "./email.ts";

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

test("rejects malformed emails the loose regex used to accept", () => {
  // Consecutive dots and dots leading/trailing the local part or domain are
  // not deliverable, yet the bare structural regex let them through.
  for (const bad of [
    "host@show..com",
    "host..name@show.com",
    ".host@show.com",
    "host.@show.com",
    "host@show.com.",
  ]) {
    const result = resolveBestEmail([{ email: bad }], "fallback@x.com");
    assert.equal(result.status, "not_found", `expected ${bad} to be rejected`);
    assert.equal(result.bestEmail, "fallback@x.com");
    assert.deepEqual(result.validCandidates, []);
  }
});

test("still accepts ordinary valid emails, incl. subdomains and plus tags", () => {
  for (const good of [
    "host@show.com",
    "first.last@mail.show.com",
    "user+tag@show.io",
  ]) {
    const result = resolveBestEmail([{ email: good }]);
    assert.equal(result.status, "found", `expected ${good} to be accepted`);
    assert.equal(result.bestEmail, good);
  }
});

test("picks the first VALID email, skipping malformed leading entries", () => {
  const result = resolveBestEmail(
    [{ email: "bad..dots@x.com" }, { email: "good@x.com" }],
    "fallback@x.com"
  );
  assert.equal(result.status, "found");
  assert.equal(result.bestEmail, "good@x.com");
  assert.equal(result.validCandidates.length, 1);
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
