import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCardCopyText } from "./cardCopy.ts";

test("prepends a Subject line when a real subject exists", () => {
  assert.equal(
    buildCardCopyText({ message_subject: "Quick idea", message_body: "Hi there" }),
    "Subject: Quick idea\n\nHi there"
  );
});

test("omits the Subject line when subject is an empty string", () => {
  assert.equal(
    buildCardCopyText({ message_subject: "", message_body: "Hi there" }),
    "Hi there"
  );
});

test("omits the Subject line when subject is whitespace-only", () => {
  assert.equal(
    buildCardCopyText({ message_subject: "   ", message_body: "Hi there" }),
    "Hi there"
  );
});

test("omits the Subject line when subject is undefined", () => {
  assert.equal(
    buildCardCopyText({ message_body: "Hi there" }),
    "Hi there"
  );
});

test("trims surrounding whitespace from a real subject", () => {
  assert.equal(
    buildCardCopyText({ message_subject: "  Let's talk  ", message_body: "Body" }),
    "Subject: Let's talk\n\nBody"
  );
});

test("preserves the message body verbatim, including internal newlines", () => {
  assert.equal(
    buildCardCopyText({ message_subject: "S", message_body: "line 1\nline 2" }),
    "Subject: S\n\nline 1\nline 2"
  );
});
