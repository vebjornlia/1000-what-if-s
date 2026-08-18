import { test } from "node:test";
import assert from "node:assert/strict";
import { openGmailCompose } from "./email.ts";

// openGmailCompose builds the URL for the primary "Open in Gmail" CTA
// (used in the send queue and QueueList). It has no return value: it hands a
// URL to window.open. These tests capture that URL so the compose-mode params
// and the encoding of user-supplied subject/body stay locked in.
function captureComposeUrl(run: () => void): string {
  const calls: string[] = [];
  const globalWithWindow = globalThis as { window?: { open: (url?: string) => void } };
  const original = globalWithWindow.window;
  globalWithWindow.window = {
    open: (url?: string) => {
      calls.push(url ?? "");
    },
  };
  try {
    run();
  } finally {
    if (original === undefined) delete globalWithWindow.window;
    else globalWithWindow.window = original;
  }
  assert.equal(calls.length, 1, "expected exactly one window.open call");
  return calls[0];
}

test("opens Gmail in compose mode with the recipient, subject, and body", () => {
  const url = new URL(
    captureComposeUrl(() =>
      openGmailCompose({ to: "host@show.com", subject: "Hi there", body: "Hello world" })
    )
  );

  assert.equal(url.origin + url.pathname, "https://mail.google.com/mail/");
  // Compose-mode magic params — breaking either silently drops the user into
  // their inbox instead of a pre-filled compose window.
  assert.equal(url.searchParams.get("view"), "cm");
  assert.equal(url.searchParams.get("fs"), "1");
  assert.equal(url.searchParams.get("to"), "host@show.com");
  assert.equal(url.searchParams.get("su"), "Hi there");
  assert.equal(url.searchParams.get("body"), "Hello world");
});

test("URL-encodes subject and body so special characters survive the query string", () => {
  const url = new URL(
    captureComposeUrl(() =>
      openGmailCompose({
        to: "a@b.com",
        subject: "Q&A: 50% off?",
        body: "Line 1\nLine 2 & more =end",
      })
    )
  );

  // Round-tripping through URL parsing proves the raw query string encoded the
  // ampersands/equals rather than injecting extra params (the regression a
  // naive string-concatenation implementation would introduce).
  assert.equal(url.searchParams.get("su"), "Q&A: 50% off?");
  assert.equal(url.searchParams.get("body"), "Line 1\nLine 2 & more =end");
});

test("defaults the recipient to an empty string when none is provided", () => {
  const url = new URL(
    captureComposeUrl(() => openGmailCompose({ subject: "S", body: "B" }))
  );

  assert.equal(url.searchParams.get("to"), "");
  assert.equal(url.searchParams.get("su"), "S");
  assert.equal(url.searchParams.get("body"), "B");
});
