import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "./validateEmail.ts";

test("accepts a normal email", () => {
  assert.equal(isValidEmail("host@show.com"), true);
});

test("accepts multi-label domains", () => {
  assert.equal(isValidEmail("first.last@mail.example.co.uk"), true);
});

test("trims surrounding whitespace before validating", () => {
  assert.equal(isValidEmail("  a@b.com  "), true);
});

test("rejects empty and whitespace-only input", () => {
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("   "), false);
});

test("rejects input with no domain part", () => {
  assert.equal(isValidEmail("foo@"), false);
});

test("rejects input with no local part", () => {
  assert.equal(isValidEmail("@bar.com"), false);
});

test("rejects a bare @ (the old .includes('@') let this through)", () => {
  assert.equal(isValidEmail("@"), false);
});

test("rejects a domain without a dot", () => {
  assert.equal(isValidEmail("a@b"), false);
});

test("rejects input with internal whitespace", () => {
  assert.equal(isValidEmail("a b@c.com"), false);
});

test("rejects input with no @ at all", () => {
  assert.equal(isValidEmail("not-an-email"), false);
});
