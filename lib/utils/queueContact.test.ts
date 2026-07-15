import { test } from "node:test";
import assert from "node:assert/strict";
import { contactWasEdited } from "./queueContact.ts";

test("unchanged contact is not an edit (the original bug)", () => {
  // Editing only the message body pre-fills "To" with the same value.
  assert.equal(contactWasEdited("host@show.com", "host@show.com"), false);
});

test("a changed email counts as an edit", () => {
  assert.equal(contactWasEdited("host@show.com", "new@show.com"), true);
});

test("surrounding whitespace alone is not an edit", () => {
  assert.equal(contactWasEdited("host@show.com", "  host@show.com  "), false);
});

test("clearing a previously set contact is an edit", () => {
  assert.equal(contactWasEdited("host@show.com", ""), true);
});

test("blank-to-blank is not an edit", () => {
  assert.equal(contactWasEdited("", ""), false);
  assert.equal(contactWasEdited(null, ""), false);
  assert.equal(contactWasEdited(null, "   "), false);
});

test("typing a real email into an empty field is an edit", () => {
  assert.equal(contactWasEdited("", "found@x.com"), true);
  assert.equal(contactWasEdited(null, "found@x.com"), true);
});

test("a non-email recipient URL left untouched is not an edit", () => {
  // resolved_contact is null but recipient_contact URL pre-fills the field;
  // saving the body must NOT re-persist it as a 'manual' email.
  const prefilled = "https://linkedin.com/in/someone";
  assert.equal(contactWasEdited(prefilled, prefilled), false);
});
