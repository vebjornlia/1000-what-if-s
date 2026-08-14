import { test } from "node:test";
import assert from "node:assert/strict";
import { profileSaveResult } from "./profileSaveResult.ts";

test("reports success when there is no error", () => {
  const outcome = profileSaveResult({ error: null });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.message, "Profile saved!");
});

test("reports success when result has no error field", () => {
  const outcome = profileSaveResult({});
  assert.equal(outcome.ok, true);
  assert.equal(outcome.message, "Profile saved!");
});

test("reports failure with detail when Supabase returns an error", () => {
  const outcome = profileSaveResult({
    error: { message: "permission denied for table profiles" },
  });
  assert.equal(outcome.ok, false);
  assert.equal(
    outcome.message,
    "Couldn't save your profile: permission denied for table profiles"
  );
});

test("reports a generic failure when the error has no message", () => {
  const outcome = profileSaveResult({ error: {} });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.message, "Couldn't save your profile. Please try again.");
});

test("treats a blank/whitespace error message as no detail", () => {
  const outcome = profileSaveResult({ error: { message: "   " } });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.message, "Couldn't save your profile. Please try again.");
});

test("treats a null result (write never attempted) as success-shaped guard", () => {
  // A null/undefined result means the caller passed nothing; there is no error
  // to report, so this is not flagged as a failure. Callers that want to signal
  // "not attempted" must pass an explicit error (see the no-user path).
  const outcome = profileSaveResult(null);
  assert.equal(outcome.ok, true);
  assert.equal(outcome.message, "Profile saved!");
});

test("trims surrounding whitespace from the error detail", () => {
  const outcome = profileSaveResult({ error: { message: "  network down  " } });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.message, "Couldn't save your profile: network down");
});
