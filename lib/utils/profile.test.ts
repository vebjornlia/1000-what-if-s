import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeProfile } from "./profile.ts";

test("coerces a comma-separated string field into a tag array (the crash bug)", () => {
  const p = normalizeProfile({ skills: "coding, design, writing" });
  assert.deepEqual(p.skills, ["coding", "design", "writing"]);
});

test("leaves a proper array field intact, trimming and dropping blanks", () => {
  const p = normalizeProfile({ interests: ["  chess ", "", "art", "  "] });
  assert.deepEqual(p.interests, ["chess", "art"]);
});

test("turns null / missing / non-string tag fields into empty arrays", () => {
  const p = normalizeProfile({ skills: null, goals: undefined });
  assert.deepEqual(p.skills, []);
  assert.deepEqual(p.goals, []);
  // Fields never provided still come back as arrays, so ProfileReview is safe.
  assert.deepEqual(p.edge_factors, []);
  assert.deepEqual(p.opportunity_types, []);
});

test("every tag field is guaranteed to be an array after normalization", () => {
  const p = normalizeProfile({
    skills: "a",
    interests: ["b"],
    goals: 42,
    edge_factors: { nope: true },
    opportunity_types: null,
  });
  for (const field of [
    "skills",
    "interests",
    "goals",
    "edge_factors",
    "opportunity_types",
  ] as const) {
    assert.ok(Array.isArray(p[field]), `${field} should be an array`);
  }
});

test("filters non-string array members and stringifies numbers", () => {
  const p = normalizeProfile({ skills: ["ok", 7, null, { x: 1 }, "fine"] });
  assert.deepEqual(p.skills, ["ok", "7", "fine"]);
});

test("preserves non-tag scalar fields untouched", () => {
  const p = normalizeProfile({
    display_name: "Ada",
    summary: "Builds things",
    occupation: "Engineer",
    tone: "casual",
    boldness_level: "high",
    skills: "x",
  });
  assert.equal(p.display_name, "Ada");
  assert.equal(p.summary, "Builds things");
  assert.equal(p.occupation, "Engineer");
  assert.equal(p.tone, "casual");
  assert.equal(p.boldness_level, "high");
});

test("tolerates non-object input (null, array, string, number)", () => {
  for (const bad of [null, undefined, "nope", 42, ["a", "b"]]) {
    const p = normalizeProfile(bad as unknown);
    assert.deepEqual(p.skills, []);
    assert.deepEqual(p.interests, []);
    assert.deepEqual(p.goals, []);
  }
});
