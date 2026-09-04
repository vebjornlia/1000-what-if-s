import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveContactEdit } from "./contactEdit.ts";

test("returns undefined when the contact is unchanged (the original bug)", () => {
  // Editor pre-filled "To" from an existing resolved email; body-only edit.
  assert.equal(resolveContactEdit("host@show.com", "host@show.com"), undefined);
});

test("returns undefined when a pre-filled non-email URL is left untouched", () => {
  // Would otherwise overwrite resolved_contact with a URL + mark it "manual".
  assert.equal(
    resolveContactEdit("linkedin.com/in/ada", "linkedin.com/in/ada"),
    undefined
  );
});

test("returns undefined when both start empty and stay empty", () => {
  assert.equal(resolveContactEdit("", ""), undefined);
});

test("returns the new value when the user actually changes the contact", () => {
  assert.equal(
    resolveContactEdit("linkedin.com/in/ada", "ada@example.com"),
    "ada@example.com"
  );
});

test("treats a whitespace-only difference as unchanged", () => {
  assert.equal(resolveContactEdit("a@b.com", "  a@b.com  "), undefined);
});

test("trims the returned value when the contact changed", () => {
  assert.equal(resolveContactEdit("", "  new@x.com  "), "new@x.com");
});

test("returns empty string when the user deliberately clears a pre-filled value", () => {
  // Explicit clear is a real change: persist it rather than keep the stale URL.
  assert.equal(resolveContactEdit("linkedin.com/in/ada", ""), "");
});
