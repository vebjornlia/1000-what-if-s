import { test } from "node:test";
import assert from "node:assert/strict";
import { getSwipeDecision } from "./swipeDecision.ts";

test("a drag dragged well past the threshold swipes that way", () => {
  assert.equal(getSwipeDecision(150, 0), "right");
  assert.equal(getSwipeDecision(-150, 0), "left");
});

test("a quick flick swipes even when it never moved far (the demo bug)", () => {
  // Below the 100px distance threshold, but flicked faster than 500 px/s.
  assert.equal(getSwipeDecision(20, 900), "right");
  assert.equal(getSwipeDecision(-20, -900), "left");
});

test("a small, slow drag snaps back (no swipe)", () => {
  assert.equal(getSwipeDecision(50, 100), "none");
  assert.equal(getSwipeDecision(-50, -100), "none");
  assert.equal(getSwipeDecision(0, 0), "none");
});

test("exactly at the threshold does not trigger (strictly greater)", () => {
  assert.equal(getSwipeDecision(100, 500), "none");
  assert.equal(getSwipeDecision(-100, -500), "none");
});

test("right is evaluated before left when a gesture satisfies both", () => {
  // Dragged right past threshold but flicked left fast — right wins,
  // matching SwipeCard's ordering.
  assert.equal(getSwipeDecision(150, -900), "right");
});

test("custom thresholds are honored", () => {
  assert.equal(getSwipeDecision(60, 0, { threshold: 50 }), "right");
  assert.equal(getSwipeDecision(60, 0, { threshold: 200 }), "none");
  assert.equal(getSwipeDecision(10, 300, { velocityThreshold: 200 }), "right");
});
