import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCardCopyText } from "./email.ts";

test("includes the provided subject and body", () => {
  assert.equal(
    buildCardCopyText({
      recipient_name: "Ada",
      message_subject: "Let's collaborate",
      message_body: "Hey Ada, quick idea.",
    }),
    "Subject: Let's collaborate\n\nHey Ada, quick idea."
  );
});

test("falls back to the default subject for a blank/whitespace subject (the bug)", () => {
  for (const blank of ["", "   ", "\n\t"]) {
    assert.equal(
      buildCardCopyText({
        recipient_name: "Ada",
        message_subject: blank,
        message_body: "Body text.",
      }),
      "Subject: Quick question for Ada\n\nBody text."
    );
  }
});

test("falls back to the default subject when the subject is missing", () => {
  assert.equal(
    buildCardCopyText({ recipient_name: "Ada", message_body: "Body text." }),
    "Subject: Quick question for Ada\n\nBody text."
  );
});

test("trims surrounding whitespace on the subject", () => {
  assert.equal(
    buildCardCopyText({
      recipient_name: "Ada",
      message_subject: "  Hello  ",
      message_body: "Body.",
    }),
    "Subject: Hello\n\nBody."
  );
});

test("trims surrounding whitespace on the body", () => {
  assert.equal(
    buildCardCopyText({
      recipient_name: "Ada",
      message_subject: "Hi",
      message_body: "\n  Body text.  \n",
    }),
    "Subject: Hi\n\nBody text."
  );
});

test("tolerates a missing body", () => {
  assert.equal(
    buildCardCopyText({ recipient_name: "Ada", message_subject: "Hi" }),
    "Subject: Hi\n\n"
  );
});
