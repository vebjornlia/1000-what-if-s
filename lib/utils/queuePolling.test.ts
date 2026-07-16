import { test } from "node:test";
import assert from "node:assert/strict";
import { hasPendingDiscovery, queueHasPending } from "./queuePolling.ts";

test("null/undefined/empty status is still pending (older rows)", () => {
  assert.equal(hasPendingDiscovery({ email_discovery_status: null }), true);
  assert.equal(hasPendingDiscovery({ email_discovery_status: undefined }), true);
  assert.equal(hasPendingDiscovery({ email_discovery_status: "" }), true);
  assert.equal(hasPendingDiscovery({}), true);
});

test("in-flight statuses are pending", () => {
  assert.equal(hasPendingDiscovery({ email_discovery_status: "pending" }), true);
  assert.equal(hasPendingDiscovery({ email_discovery_status: "searching" }), true);
});

test("terminal statuses are NOT pending", () => {
  assert.equal(hasPendingDiscovery({ email_discovery_status: "found" }), false);
  assert.equal(hasPendingDiscovery({ email_discovery_status: "not_found" }), false);
  assert.equal(hasPendingDiscovery({ email_discovery_status: "manual" }), false);
});

test("queueHasPending is true when any card is unresolved", () => {
  assert.equal(
    queueHasPending([
      { email_discovery_status: "found" },
      { email_discovery_status: "searching" },
    ]),
    true
  );
});

test("queueHasPending is false when every card is terminal", () => {
  assert.equal(
    queueHasPending([
      { email_discovery_status: "found" },
      { email_discovery_status: "not_found" },
      { email_discovery_status: "manual" },
    ]),
    false
  );
});

test("queueHasPending on an empty queue is false (nothing to poll for)", () => {
  assert.equal(queueHasPending([]), false);
});
