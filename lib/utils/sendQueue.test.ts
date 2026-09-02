import { test } from "node:test";
import assert from "node:assert/strict";
import { partitionSendable } from "./sendQueue.ts";

test("prefers resolved_contact when it is a valid email", () => {
  const { sendable, skipped } = partitionSendable([
    { id: "a", resolved_contact: "host@show.com", recipient_contact: "https://x.com" },
  ]);
  assert.equal(sendable.length, 1);
  assert.equal(skipped.length, 0);
  assert.equal(sendable[0].id, "a");
});

test("falls back to recipient_contact when it is a valid email", () => {
  const { sendable, skipped } = partitionSendable([
    { id: "a", resolved_contact: null, recipient_contact: "info@show.com" },
  ]);
  assert.equal(sendable.length, 1);
  assert.equal(skipped.length, 0);
});

test("skips cards whose recipient_contact is a non-email URL (the original bug)", () => {
  const { sendable, skipped } = partitionSendable([
    { id: "a", resolved_contact: null, recipient_contact: "https://instagram.com/host" },
  ]);
  assert.equal(sendable.length, 0);
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].id, "a");
});

test("skips cards with no contact at all", () => {
  const { sendable, skipped } = partitionSendable([
    { id: "a", resolved_contact: null, recipient_contact: "" },
    { id: "b" },
  ]);
  assert.equal(sendable.length, 0);
  assert.equal(skipped.length, 2);
});

test("skips a blank/whitespace resolved_contact and does not send", () => {
  const { sendable, skipped } = partitionSendable([
    { id: "a", resolved_contact: "   ", recipient_contact: "also-not-email" },
  ]);
  assert.equal(sendable.length, 0);
  assert.equal(skipped.length, 1);
});

test("partitions a mixed queue into sendable and skipped", () => {
  const { sendable, skipped } = partitionSendable([
    { id: "a", resolved_contact: "a@x.com", recipient_contact: "" },
    { id: "b", resolved_contact: null, recipient_contact: "https://x.com/b" },
    { id: "c", resolved_contact: null, recipient_contact: "c@x.com" },
  ]);
  assert.deepEqual(sendable.map((i) => i.id), ["a", "c"]);
  assert.deepEqual(skipped.map((i) => i.id), ["b"]);
});
