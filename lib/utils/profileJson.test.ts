import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProfileJson } from "./profileJson.ts";

test("parses clean JSON object", () => {
  const result = parseProfileJson('{"name":"Ada","goal":"ship"}');
  assert.deepEqual(result, { name: "Ada", goal: "ship" });
});

test("parses JSON fenced in a ```json code block", () => {
  const result = parseProfileJson('```json\n{"name":"Ada"}\n```');
  assert.deepEqual(result, { name: "Ada" });
});

test("parses JSON fenced in a bare ``` block", () => {
  const result = parseProfileJson('```\n{"name":"Ada"}\n```');
  assert.deepEqual(result, { name: "Ada" });
});

test("extracts a JSON object embedded in prose", () => {
  const result = parseProfileJson('Here is the profile: {"name":"Ada"} — done.');
  assert.deepEqual(result, { name: "Ada" });
});

test("returns {} for malformed braces instead of throwing (the original 500 bug)", () => {
  // A bare `JSON.parse(match[0])` on this would throw and surface as HTTP 500.
  const result = parseProfileJson("Sorry, I couldn't do that {not: valid json}");
  assert.deepEqual(result, {});
});

test("returns {} for empty string", () => {
  assert.deepEqual(parseProfileJson(""), {});
});

test("returns {} for non-string input", () => {
  assert.deepEqual(parseProfileJson(null), {});
  assert.deepEqual(parseProfileJson(undefined), {});
  assert.deepEqual(parseProfileJson(42), {});
});

test("does not accept a top-level JSON array as a profile", () => {
  assert.deepEqual(parseProfileJson("[1,2,3]"), {});
});

test("does not accept a top-level JSON primitive as a profile", () => {
  assert.deepEqual(parseProfileJson('"just a string"'), {});
  assert.deepEqual(parseProfileJson("null"), {});
});

test("prefers valid fenced JSON even when surrounding prose has stray braces", () => {
  const text = 'Note {incomplete\n```json\n{"name":"Ada","level":"bold"}\n```';
  const result = parseProfileJson(text);
  assert.deepEqual(result, { name: "Ada", level: "bold" });
});
