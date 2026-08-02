import { test } from "node:test";
import assert from "node:assert/strict";
import { profileSaveResult } from "./saveResult.ts";

test("reports success when there is no error", () => {
  const result = profileSaveResult(null);
  assert.equal(result.ok, true);
  assert.equal(result.message, "Profile saved!");
});

test("treats undefined error as success", () => {
  const result = profileSaveResult(undefined);
  assert.equal(result.ok, true);
  assert.equal(result.message, "Profile saved!");
});

test("reports failure (not success) when the write errors — the original bug", () => {
  const result = profileSaveResult({ message: "permission denied" });
  assert.equal(result.ok, false);
  assert.equal(result.message, "Couldn't save your profile: permission denied");
});

test("uses a generic message when the error has no detail", () => {
  for (const blank of [{}, { message: "" }, { message: "   " }]) {
    const result = profileSaveResult(blank);
    assert.equal(result.ok, false);
    assert.equal(
      result.message,
      "Couldn't save your profile. Please try again."
    );
  }
});
