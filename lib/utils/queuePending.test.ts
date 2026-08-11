import { test } from "node:test";
import assert from "node:assert/strict";
import { hasPendingDiscovery } from "./queuePending.ts";

test("hasPendingDiscovery is false for an empty queue", () => {
  assert.equal(hasPendingDiscovery([]), false);
});

test("hasPendingDiscovery is false when every item is resolved", () => {
  assert.equal(
    hasPendingDiscovery([
      { email_discovery_status: "found" },
      { email_discovery_status: "not_found" },
      { email_discovery_status: "manual" },
    ]),
    false
  );
});

test("hasPendingDiscovery is true for a 'pending' item", () => {
  assert.equal(
    hasPendingDiscovery([
      { email_discovery_status: "found" },
      { email_discovery_status: "pending" },
    ]),
    true
  );
});

test("hasPendingDiscovery is true for a 'searching' item", () => {
  assert.equal(hasPendingDiscovery([{ email_discovery_status: "searching" }]), true);
});

test("hasPendingDiscovery treats missing/empty/null status as pending", () => {
  assert.equal(hasPendingDiscovery([{}]), true);
  assert.equal(hasPendingDiscovery([{ email_discovery_status: "" }]), true);
  assert.equal(hasPendingDiscovery([{ email_discovery_status: null }]), true);
});

test("hasPendingDiscovery does not treat unrelated statuses as pending", () => {
  assert.equal(hasPendingDiscovery([{ email_discovery_status: "found" }]), false);
});
