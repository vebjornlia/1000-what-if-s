import { test } from "node:test";
import assert from "node:assert/strict";
import { initialRecipient } from "./messageRecipient.ts";

test("prefers a resolved (discovered) contact verbatim", () => {
  assert.equal(
    initialRecipient({
      resolved_contact: "host@show.com",
      recipient_contact: "https://linkedin.com/in/host",
    }),
    "host@show.com"
  );
});

test("uses recipient_contact when it is a valid email and nothing is resolved", () => {
  assert.equal(
    initialRecipient({ resolved_contact: null, recipient_contact: "hello@studio.com" }),
    "hello@studio.com"
  );
});

test("does NOT prefill a URL recipient_contact into the email field (the bug)", () => {
  for (const url of [
    "https://linkedin.com/in/someone",
    "twitter.com/someone",
    "https://example.com/contact",
    "@handle",
  ]) {
    assert.equal(
      initialRecipient({ resolved_contact: null, recipient_contact: url }),
      ""
    );
  }
});

test("returns empty string when both contacts are missing", () => {
  assert.equal(initialRecipient({}), "");
  assert.equal(initialRecipient({ resolved_contact: null, recipient_contact: "" }), "");
});

test("ignores a whitespace-only resolved contact and falls through", () => {
  assert.equal(
    initialRecipient({ resolved_contact: "   ", recipient_contact: "real@x.com" }),
    "real@x.com"
  );
});

test("trims surrounding whitespace on the chosen value", () => {
  assert.equal(
    initialRecipient({ resolved_contact: "  host@show.com  " }),
    "host@show.com"
  );
  assert.equal(
    initialRecipient({ recipient_contact: "  hi@x.com  " }),
    "hi@x.com"
  );
});
