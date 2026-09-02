// The onboarding AI signals it is finished by appending a completion marker to
// its final message. The exact token is "[INTERVIEW_COMPLETE]", but the model
// is untrusted and occasionally emits variants (different casing or stray
// spaces inside the brackets). A brittle exact-string match has two failure
// modes at once: the marker LEAKS into the chat bubble the user sees, and the
// auto-extract step never fires. This tolerant matcher handles both display
// cleaning and completion detection in one place so they can never disagree.
const INTERVIEW_COMPLETE_RE = /\[\s*INTERVIEW_COMPLETE\s*\]/gi;

/**
 * Parses a raw assistant message from the onboarding interview.
 *
 * @returns `display` — the message with any completion marker stripped and
 * trimmed, safe to show the user; and `isComplete` — whether the assistant
 * signalled that the interview is finished.
 */
export function parseAssistantMessage(raw: unknown): {
  display: string;
  isComplete: boolean;
} {
  const text = typeof raw === "string" ? raw : "";
  // Reset lastIndex: the regex is global, and `.test()` mutates lastIndex.
  INTERVIEW_COMPLETE_RE.lastIndex = 0;
  const isComplete = INTERVIEW_COMPLETE_RE.test(text);
  const display = text.replace(INTERVIEW_COMPLETE_RE, "").trim();
  return { display, isComplete };
}
