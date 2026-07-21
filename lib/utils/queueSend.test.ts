import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSendableEmail, partitionSendable } from "./queueSend.ts";

test("prefers the resolved contact when it is a valid email", () => {
  assert.equal(
    resolveSendableEmail({
      resolved_contact: "host@show.com",
      recipient_contact: "https://booking.example/host",
    }),
    "host@show.com"
  );
});

test("falls back to recipient_contact when resolved is missing but recipient is an email", () => {
  assert.equal(
    resolveSendableEmail({
      resolved_contact: null,
      recipient_contact: "info@show.com",
    }),
    "info@show.com"
  );
});

test("returns null when neither contact is a usable email (the bug)", () => {
  assert.equal(
    resolveSendableEmail({
      resolved_contact: null,
      recipient_contact: "https://twitter.com/host",
    }),
    null
  );
  assert.equal(resolveSendableEmail({}), null);
});

test("trims surrounding whitespace on the chosen email", () => {
  assert.equal(
    resolveSendableEmail({ resolved_contact: "  spaced@x.com  " }),
    "spaced@x.com"
  );
});

test("partitionSendable keeps cards without an email in the queue and only sends the rest", () => {
  const items = [
    { id: "a", resolved_contact: "a@x.com", recipient_contact: "" },
    { id: "b", resolved_contact: null, recipient_contact: "https://link/b" },
    { id: "c", resolved_contact: null, recipient_contact: "c@x.com" },
  ];
  const { sendable, skipped } = partitionSendable(items);

  assert.deepEqual(
    sendable.map((s) => [s.card.id, s.to]),
    [
      ["a", "a@x.com"],
      ["c", "c@x.com"],
    ]
  );
  assert.deepEqual(
    skipped.map((s) => s.id),
    ["b"]
  );
});

test("partitionSendable returns nothing to send when no card has an email", () => {
  const items = [
    { id: "a", resolved_contact: null, recipient_contact: "https://x/a" },
    { id: "b", resolved_contact: "", recipient_contact: "not-an-email" },
  ];
  const { sendable, skipped } = partitionSendable(items);

  assert.equal(sendable.length, 0);
  assert.deepEqual(
    skipped.map((s) => s.id),
    ["a", "b"]
  );
});
