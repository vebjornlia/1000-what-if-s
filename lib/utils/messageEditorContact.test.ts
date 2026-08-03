import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveContactEdit } from "./messageEditorContact.ts";

test("returns undefined when the contact is unchanged (the original bug)", () => {
  assert.equal(
    resolveContactEdit("host@show.com", "host@show.com"),
    undefined
  );
});

test("returns undefined when only surrounding whitespace differs", () => {
  assert.equal(resolveContactEdit("host@show.com", "  host@show.com  "), undefined);
});

test("does not re-persist an untouched non-email URL", () => {
  // resolved_contact was empty, so the field was pre-filled with a URL contact.
  assert.equal(
    resolveContactEdit("linkedin.com/in/ada", "linkedin.com/in/ada"),
    undefined
  );
});

test("returns the trimmed new value when the user changes it", () => {
  assert.equal(
    resolveContactEdit("old@x.com", "  new@x.com  "),
    "new@x.com"
  );
});

test("returns a real email the user typed over an empty pre-fill", () => {
  assert.equal(resolveContactEdit("", "real@x.com"), "real@x.com");
});

test("returns empty string when the user deliberately clears a set contact", () => {
  assert.equal(resolveContactEdit("old@x.com", "   "), "");
});

test("returns undefined when both sides are blank", () => {
  assert.equal(resolveContactEdit("", ""), undefined);
  assert.equal(resolveContactEdit("   ", ""), undefined);
});
