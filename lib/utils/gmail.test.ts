import { test } from "node:test";
import assert from "node:assert/strict";
import { gmailComposeUrl } from "./email.ts";

// Regression tests for the Gmail compose URL builder.
//
// The bug: building the URL with `URLSearchParams` encodes spaces as `+`,
// which Gmail's `view=cm` compose endpoint renders literally ("Quick+idea").
// The fix encodes with `encodeURIComponent` so spaces become `%20`, which
// every URL parser (including Gmail) decodes back to a real space.

test("encodes spaces in the subject as %20, never as +", () => {
  const url = gmailComposeUrl({ subject: "Quick idea for you", body: "" });
  assert.ok(url.includes("su=Quick%20idea%20for%20you"), url);
  assert.ok(!url.includes("Quick+idea"), "subject must not use + for spaces");
});

test("encodes spaces in the body as %20, never as +", () => {
  const url = gmailComposeUrl({ subject: "s", body: "hello there world" });
  assert.ok(url.includes("body=hello%20there%20world"), url);
  assert.ok(!/body=[^&]*\+/.test(url), "body must not use + for spaces");
});

test("subject and body round-trip back to the original text", () => {
  const subject = "Quick idea for you";
  const body = "Hi there,\n\nWant to build something together?";
  const parsed = new URL(gmailComposeUrl({ to: "a@x.com", subject, body }));
  assert.equal(parsed.searchParams.get("su"), subject);
  assert.equal(parsed.searchParams.get("body"), body);
  assert.equal(parsed.searchParams.get("to"), "a@x.com");
});

test("carries the compose flags Gmail requires", () => {
  const parsed = new URL(gmailComposeUrl({ subject: "s", body: "b" }));
  assert.equal(parsed.searchParams.get("view"), "cm");
  assert.equal(parsed.searchParams.get("fs"), "1");
});

test("defaults an omitted recipient to an empty `to`", () => {
  const parsed = new URL(gmailComposeUrl({ subject: "s", body: "b" }));
  assert.equal(parsed.searchParams.get("to"), "");
});

test("preserves a literal + in an email recipient (encoded as %2B)", () => {
  const url = gmailComposeUrl({ to: "a+tag@x.com", subject: "s", body: "b" });
  assert.ok(url.includes("to=a%2Btag%40x.com"), url);
  assert.equal(new URL(url).searchParams.get("to"), "a+tag@x.com");
});
