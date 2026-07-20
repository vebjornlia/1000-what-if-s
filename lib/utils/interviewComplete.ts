// The onboarding AI is instructed to end the interview by emitting the exact
// marker "[INTERVIEW_COMPLETE]". Its output is untrusted, though: it may
// mis-case the marker, swap the underscore for a space, or pad the brackets.
// If we only matched the exact literal, a reformatted marker would (a) leak
// visibly into the chat transcript and (b) never trigger the transition to
// profile extraction — stranding the user in an interview that appears to have
// ended. These helpers match the marker tolerantly so both symptoms are fixed.
const MARKER_SOURCE = "\\[\\s*interview[\\s_]*complete\\s*\\]";

/** True if the text contains an INTERVIEW_COMPLETE marker (case/format tolerant). */
export function hasInterviewComplete(text: unknown): boolean {
  if (typeof text !== "string") return false;
  return new RegExp(MARKER_SOURCE, "i").test(text);
}

/** Removes every INTERVIEW_COMPLETE marker and trims surrounding whitespace. */
export function stripInterviewComplete(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.replace(new RegExp(MARKER_SOURCE, "gi"), "").trim();
}
