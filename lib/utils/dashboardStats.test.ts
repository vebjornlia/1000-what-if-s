import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDashboardStats, UNCATEGORIZED } from "./dashboardStats.ts";

test("counts each status and total", () => {
  const stats = computeDashboardStats([
    { status: "unseen", category: "Podcast" },
    { status: "unseen", category: "Podcast" },
    { status: "skipped", category: "Press" },
    { status: "queued", category: "Press" },
    { status: "sent", category: "Collab" },
  ]);
  assert.equal(stats.total, 5);
  assert.equal(stats.unseen, 2);
  assert.equal(stats.skipped, 1);
  assert.equal(stats.queued, 1);
  assert.equal(stats.sent, 1);
});

test("counts replies independently of status", () => {
  const stats = computeDashboardStats([
    { status: "sent", got_reply: true },
    { status: "sent", got_reply: false },
    { status: "sent", got_reply: true },
  ]);
  assert.equal(stats.sent, 3);
  assert.equal(stats.replied, 2);
});

test("categories are aggregated and sorted by count descending", () => {
  const stats = computeDashboardStats([
    { category: "Press" },
    { category: "Podcast" },
    { category: "Podcast" },
    { category: "Podcast" },
    { category: "Press" },
  ]);
  assert.deepEqual(stats.categories, [
    { name: "Podcast", value: 3 },
    { name: "Press", value: 2 },
  ]);
});

test("null/undefined/blank categories bucket under Uncategorized (the bug)", () => {
  const stats = computeDashboardStats([
    { category: null },
    { category: undefined },
    { category: "" },
    { category: "   " },
    { category: "Podcast" },
  ]);
  assert.deepEqual(stats.categories, [
    { name: UNCATEGORIZED, value: 4 },
    { name: "Podcast", value: 1 },
  ]);
  // No blank/"null" label leaks into the chart data.
  assert.ok(stats.categories.every((c) => c.name.trim().length > 0));
});

test("trims surrounding whitespace on category labels so duplicates merge", () => {
  const stats = computeDashboardStats([
    { category: "Podcast" },
    { category: " Podcast " },
  ]);
  assert.deepEqual(stats.categories, [{ name: "Podcast", value: 2 }]);
});

test("tolerates null/undefined input", () => {
  for (const bad of [null, undefined]) {
    const stats = computeDashboardStats(bad);
    assert.equal(stats.total, 0);
    assert.deepEqual(stats.categories, []);
    assert.equal(stats.replied, 0);
  }
});

test("unknown statuses count toward total but no status bucket", () => {
  const stats = computeDashboardStats([
    { status: "archived", category: "Press" },
    { status: "unseen", category: "Press" },
  ]);
  assert.equal(stats.total, 2);
  assert.equal(stats.unseen, 1);
  assert.equal(stats.skipped + stats.queued + stats.sent, 0);
});
