import { test } from "node:test";
import assert from "node:assert/strict";
import { buildClipboardText } from "./clipboard.ts";
import { getMessageSubject } from "./email.ts";

test("formats a subject line, blank line, then the body", () => {
  assert.equal(
    buildClipboardText("Loved your podcast", "Hey Ada, quick idea..."),
    "Subject: Loved your podcast\n\nHey Ada, quick idea..."
  );
});

// End-to-end of the queue "Copy" path: subject is resolved exactly like the
// "Send via Gmail" button (getMessageSubject), so a blank/whitespace subject
// yields the default line instead of the old "Subject:    " leak.
test("copy path uses the default subject for a blank/whitespace subject (the bug)", () => {
  for (const blank of ["", "   ", "\n\t"]) {
    const card = {
      recipient_name: "Ada",
      message_subject: blank,
      message_body: "Body here",
    };
    assert.equal(
      buildClipboardText(getMessageSubject(card), card.message_body),
      "Subject: Quick question for Ada\n\nBody here"
    );
  }
});

test("copy path keeps a real subject verbatim (trimmed)", () => {
  const card = {
    recipient_name: "Ada",
    message_subject: "  Real subject  ",
    message_body: "Body here",
  };
  assert.equal(
    buildClipboardText(getMessageSubject(card), card.message_body),
    "Subject: Real subject\n\nBody here"
  );
});
