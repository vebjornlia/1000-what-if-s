import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidManualEmail, normalizeManualEmail } from "./manualEmail.ts";

test("accepts a well-formed address", () => {
  assert.equal(isValidManualEmail("bob@example.com"), true);
});

test("trims surrounding whitespace before validating", () => {
  assert.equal(isValidManualEmail("  bob@example.com  "), true);
  assert.equal(normalizeManualEmail("  bob@example.com  "), "bob@example.com");
});

test("rejects the old '@' / partial inputs that .includes('@') let through", () => {
  assert.equal(isValidManualEmail("@"), false);
  assert.equal(isValidManualEmail("a@"), false);
  assert.equal(isValidManualEmail("@b.com"), false);
  assert.equal(isValidManualEmail("bob@localhost"), false); // no dotted domain
});

test("rejects blank and whitespace-only input", () => {
  assert.equal(isValidManualEmail(""), false);
  assert.equal(isValidManualEmail("   "), false);
});

test("rejects an address with internal whitespace", () => {
  assert.equal(isValidManualEmail("bob @example.com"), false);
  assert.equal(isValidManualEmail("bob@ex ample.com"), false);
});
