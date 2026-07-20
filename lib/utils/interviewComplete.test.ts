import { test } from "node:test";
import assert from "node:assert/strict";
import { hasInterviewComplete, stripInterviewComplete } from "./interviewComplete.ts";

test("detects the exact marker", () => {
  assert.equal(hasInterviewComplete("Great chat! [INTERVIEW_COMPLETE]"), true);
});

test("detects a mis-cased marker (the AI-output bug)", () => {
  assert.equal(hasInterviewComplete("all done [interview_complete]"), true);
  assert.equal(hasInterviewComplete("[Interview_Complete]"), true);
});

test("detects a space instead of an underscore and padded brackets", () => {
  assert.equal(hasInterviewComplete("[ INTERVIEW COMPLETE ]"), true);
});

test("returns false when no marker is present", () => {
  assert.equal(hasInterviewComplete("Tell me more about your work"), false);
});

test("is safe for non-string input", () => {
  assert.equal(hasInterviewComplete(undefined), false);
  assert.equal(hasInterviewComplete(null), false);
  assert.equal(hasInterviewComplete(42), false);
});

test("strips the exact marker and trims", () => {
  assert.equal(
    stripInterviewComplete("Love it — go find opportunities. [INTERVIEW_COMPLETE]"),
    "Love it — go find opportunities."
  );
});

test("strips a mis-cased / reformatted marker so it never leaks into chat", () => {
  assert.equal(stripInterviewComplete("Bye [interview complete]"), "Bye");
  assert.equal(stripInterviewComplete("[Interview_Complete] done"), "done");
});

test("strips every occurrence", () => {
  assert.equal(
    stripInterviewComplete("[INTERVIEW_COMPLETE] a [interview_complete] b [INTERVIEW_COMPLETE]"),
    "a  b"
  );
});

test("leaves text without a marker unchanged (aside from trim)", () => {
  assert.equal(stripInterviewComplete("  hello there  "), "hello there");
});

test("returns empty string for non-string input", () => {
  assert.equal(stripInterviewComplete(null), "");
  assert.equal(stripInterviewComplete(undefined), "");
});
