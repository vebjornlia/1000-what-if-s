import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCopyText } from "./copy.ts";
import { getMessageSubject } from "./email.ts";

test("buildCopyText joins a resolved subject and body", () => {
  assert.equal(
    buildCopyText("Loved your talk", "Hi Ada, quick note..."),
    "Subject: Loved your talk\n\nHi Ada, quick note..."
  );
});

test("buildCopyText treats a missing body as empty, not the string 'undefined'", () => {
  assert.equal(buildCopyText("Hi"), "Subject: Hi\n\n");
});

// End-to-end: the deck's copy text is assembled from getMessageSubject, so it
// must match what gets sent. These would have caught the leaked-blank-subject
// bug where a whitespace-only message_subject produced "Subject:   \n\n...".
test("copy text falls back to the default subject for a whitespace-only subject", () => {
  const card = {
    recipient_name: "Ada",
    message_subject: "   ",
    message_body: "Hi Ada",
  };
  const text = buildCopyText(getMessageSubject(card), card.message_body);
  assert.equal(text, "Subject: Quick question for Ada\n\nHi Ada");
  assert.ok(!text.startsWith("Subject: \n"), "blank subject must not leak");
});

test("copy text uses the default subject when message_subject is missing", () => {
  const card = { recipient_name: "Grace", message_body: "Hello Grace" };
  const text = buildCopyText(getMessageSubject(card), card.message_body);
  assert.equal(text, "Subject: Quick question for Grace\n\nHello Grace");
});

test("copy text keeps and trims a real subject", () => {
  const card = {
    recipient_name: "Ada",
    message_subject: "  Hello  ",
    message_body: "Body",
  };
  const text = buildCopyText(getMessageSubject(card), card.message_body);
  assert.equal(text, "Subject: Hello\n\nBody");
});
