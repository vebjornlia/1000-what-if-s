import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidManualEmail } from "./manualEmail.ts";

test("accepts a normal email", () => {
  assert.equal(isValidManualEmail("jane@example.com"), true);
});

test("accepts an email with surrounding whitespace", () => {
  assert.equal(isValidManualEmail("  jane@example.com  "), true);
});

test("rejects a bare @ sign", () => {
  assert.equal(isValidManualEmail("@"), false);
});

test("rejects a missing domain", () => {
  assert.equal(isValidManualEmail("foo@"), false);
});

test("rejects a missing local part", () => {
  assert.equal(isValidManualEmail("@bar.com"), false);
});

test("rejects a domain with no dot", () => {
  assert.equal(isValidManualEmail("foo@bar"), false);
});

test("rejects a value with no @ at all", () => {
  assert.equal(isValidManualEmail("not-an-email"), false);
});

test("rejects an empty / whitespace-only string", () => {
  assert.equal(isValidManualEmail(""), false);
  assert.equal(isValidManualEmail("   "), false);
});

test("rejects non-string input", () => {
  assert.equal(isValidManualEmail(null), false);
  assert.equal(isValidManualEmail(undefined), false);
  assert.equal(isValidManualEmail(42), false);
});
