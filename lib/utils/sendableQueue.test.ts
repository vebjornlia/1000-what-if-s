import { test } from "node:test";
import assert from "node:assert/strict";
import { sendableEmail, partitionSendable } from "./sendableQueue.ts";

test("prefers a valid resolved_contact", () => {
  assert.equal(
    sendableEmail({ resolved_contact: "host@show.com", recipient_contact: "https://show.com" }),
    "host@show.com"
  );
});

test("falls back to recipient_contact when it is a valid email", () => {
  assert.equal(
    sendableEmail({ resolved_contact: null, recipient_contact: "info@show.com" }),
    "info@show.com"
  );
});

test("returns null when recipient_contact is a non-email URL (the original bug)", () => {
  assert.equal(
    sendableEmail({ resolved_contact: null, recipient_contact: "https://instagram.com/foo" }),
    null
  );
});

test("returns null when both contacts are missing/blank", () => {
  assert.equal(sendableEmail({ resolved_contact: "   ", recipient_contact: "" }), null);
  assert.equal(sendableEmail({}), null);
});

test("trims surrounding whitespace off a valid email", () => {
  assert.equal(
    sendableEmail({ resolved_contact: "  host@show.com  " }),
    "host@show.com"
  );
});

test("ignores a malformed resolved_contact and falls back to a valid recipient", () => {
  assert.equal(
    sendableEmail({ resolved_contact: "not-an-email", recipient_contact: "real@x.com" }),
    "real@x.com"
  );
});

test("partitionSendable keeps unsendable cards and only marks sendable ones", () => {
  const items = [
    { id: "a", resolved_contact: "a@x.com", recipient_contact: "" },
    { id: "b", resolved_contact: null, recipient_contact: "https://x.com" },
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
  assert.deepEqual(skipped.map((c) => c.id), ["b"]);
});

test("partitionSendable returns all skipped when nothing is sendable", () => {
  const items = [
    { id: "a", resolved_contact: null, recipient_contact: "https://x.com" },
    { id: "b", resolved_contact: "", recipient_contact: "" },
  ];
  const { sendable, skipped } = partitionSendable(items);
  assert.equal(sendable.length, 0);
  assert.deepEqual(skipped.map((c) => c.id), ["a", "b"]);
});
