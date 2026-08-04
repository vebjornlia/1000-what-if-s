import { test } from "node:test";
import assert from "node:assert/strict";
import { pickSendAddress, hasSendableEmail, partitionSendable } from "./queueSend.ts";

test("pickSendAddress prefers the resolved contact", () => {
  assert.equal(
    pickSendAddress({ resolved_contact: "a@x.com", recipient_contact: "b@x.com" }),
    "a@x.com"
  );
});

test("pickSendAddress falls back to recipient contact, then empty", () => {
  assert.equal(
    pickSendAddress({ resolved_contact: null, recipient_contact: "b@x.com" }),
    "b@x.com"
  );
  assert.equal(pickSendAddress({ resolved_contact: null, recipient_contact: null }), "");
  assert.equal(pickSendAddress({ resolved_contact: "  spaced@x.com  " }), "spaced@x.com");
});

test("hasSendableEmail accepts a valid email", () => {
  assert.equal(hasSendableEmail({ resolved_contact: "host@show.com" }), true);
  assert.equal(hasSendableEmail({ recipient_contact: "info@show.com" }), true);
});

test("hasSendableEmail rejects blanks, nulls, and non-email contacts", () => {
  assert.equal(hasSendableEmail({ resolved_contact: null, recipient_contact: null }), false);
  assert.equal(hasSendableEmail({ resolved_contact: "" }), false);
  assert.equal(hasSendableEmail({ recipient_contact: "https://instagram.com/host" }), false);
  assert.equal(hasSendableEmail({ recipient_contact: "not-an-email" }), false);
  assert.equal(hasSendableEmail({ recipient_contact: "@no-local.com" }), false);
});

test("partitionSendable keeps only emailable cards as sendable (the bug)", () => {
  const items = [
    { id: "1", resolved_contact: "real@x.com", recipient_contact: null },
    { id: "2", resolved_contact: null, recipient_contact: "https://x.com/handle" },
    { id: "3", resolved_contact: null, recipient_contact: null },
    { id: "4", resolved_contact: null, recipient_contact: "second@x.com" },
  ];
  const { sendable, skipped } = partitionSendable(items);
  assert.deepEqual(sendable.map((i) => i.id), ["1", "4"]);
  assert.deepEqual(skipped.map((i) => i.id), ["2", "3"]);
});

test("partitionSendable handles an empty queue", () => {
  const { sendable, skipped } = partitionSendable([]);
  assert.deepEqual(sendable, []);
  assert.deepEqual(skipped, []);
});
