import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretProfileSave } from "./profileSave.ts";

test("ok when there is a user and no upsert error", () => {
  const result = interpretProfileSave({ id: "abc" }, null);
  assert.equal(result.ok, true);
  assert.equal(result.message, "");
});

test("not ok when the user is missing (the silent skip bug)", () => {
  for (const noUser of [null, undefined]) {
    const result = interpretProfileSave(noUser, null);
    assert.equal(result.ok, false);
    assert.match(result.message, /sign in/i);
  }
});

test("not ok when the upsert returned an error (the silent failure bug)", () => {
  const result = interpretProfileSave(
    { id: "abc" },
    { message: "duplicate key value violates unique constraint" }
  );
  assert.equal(result.ok, false);
  assert.match(result.message, /couldn't save/i);
});

test("missing user takes precedence over an upsert error", () => {
  const result = interpretProfileSave(null, { message: "boom" });
  assert.equal(result.ok, false);
  assert.match(result.message, /sign in/i);
});

test("an empty error object still counts as a failure", () => {
  const result = interpretProfileSave({ id: "abc" }, {});
  assert.equal(result.ok, false);
  assert.equal(result.message, "We couldn't save your profile. Please try again.");
});
