import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAssistantMessage } from "./interview.ts";

test("strips the exact marker and reports completion", () => {
  const result = parseAssistantMessage(
    "Love it — I've got a great picture of who you are. [INTERVIEW_COMPLETE]"
  );
  assert.equal(result.isComplete, true);
  assert.equal(
    result.display,
    "Love it — I've got a great picture of who you are."
  );
});

test("a plain message without the marker is not complete", () => {
  const result = parseAssistantMessage("What do you do for work?");
  assert.equal(result.isComplete, false);
  assert.equal(result.display, "What do you do for work?");
});

test("detects and strips a lowercase marker variant (the leak bug)", () => {
  const result = parseAssistantMessage("All done here. [interview_complete]");
  assert.equal(result.isComplete, true);
  assert.equal(result.display, "All done here.");
});

test("tolerates stray whitespace inside the brackets", () => {
  const result = parseAssistantMessage("Wrapping up now.[ INTERVIEW_COMPLETE ]");
  assert.equal(result.isComplete, true);
  assert.equal(result.display, "Wrapping up now.");
});

test("removes every occurrence of the marker", () => {
  const result = parseAssistantMessage(
    "[INTERVIEW_COMPLETE] thanks [INTERVIEW_COMPLETE]"
  );
  assert.equal(result.isComplete, true);
  assert.equal(result.display, "thanks");
});

test("non-string input yields an empty, incomplete result", () => {
  assert.deepEqual(parseAssistantMessage(undefined), {
    display: "",
    isComplete: false,
  });
  assert.deepEqual(parseAssistantMessage(null), {
    display: "",
    isComplete: false,
  });
});

test("global regex state does not leak between calls", () => {
  // Two identical calls must return identical results; a mishandled global
  // regex lastIndex would make the second call disagree with the first.
  const a = parseAssistantMessage("Done. [INTERVIEW_COMPLETE]");
  const b = parseAssistantMessage("Done. [INTERVIEW_COMPLETE]");
  assert.deepEqual(a, b);
  assert.equal(b.isComplete, true);
});
