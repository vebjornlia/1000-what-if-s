import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldAutoGenerate } from "./deckGenerate.ts";

test("triggers when the flag is exactly 'true' and nothing blocks it", () => {
  assert.equal(
    shouldAutoGenerate({
      generateFlag: "true",
      alreadyTriggered: false,
      generating: false,
    }),
    true
  );
});

test("does not trigger when the flag is missing", () => {
  assert.equal(
    shouldAutoGenerate({
      generateFlag: null,
      alreadyTriggered: false,
      generating: false,
    }),
    false
  );
});

test("does not trigger for a non-'true' flag value", () => {
  for (const flag of ["false", "1", "TRUE", "yes", ""]) {
    assert.equal(
      shouldAutoGenerate({
        generateFlag: flag,
        alreadyTriggered: false,
        generating: false,
      }),
      false
    );
  }
});

test("does not re-trigger once already triggered (the reload/re-run bug)", () => {
  assert.equal(
    shouldAutoGenerate({
      generateFlag: "true",
      alreadyTriggered: true,
      generating: false,
    }),
    false
  );
});

test("does not trigger while a generation is already in flight", () => {
  assert.equal(
    shouldAutoGenerate({
      generateFlag: "true",
      alreadyTriggered: false,
      generating: true,
    }),
    false
  );
});
