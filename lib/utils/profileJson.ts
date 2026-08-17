/**
 * Safely parses the profile JSON returned by the onboarding extraction model.
 *
 * The model output is untrusted: it may be clean JSON, JSON fenced in a
 * ```json code block, or JSON embedded in prose. Earlier code tried a bare
 * `JSON.parse` and, on failure, a single regex-extracted `JSON.parse(match[0])`
 * with NO guard — so malformed braces threw and surfaced as an HTTP 500,
 * blanking the user's extracted profile instead of degrading to an empty one.
 *
 * This helper tries each candidate in turn and NEVER throws: on total failure
 * it returns an empty object so onboarding can continue.
 */
export function parseProfileJson(text: unknown): Record<string, unknown> {
  if (typeof text !== "string") return {};

  const trimmed = text.trim();
  const candidates: string[] = [trimmed];

  // Prefer the contents of a fenced ```json ... ``` (or plain ``` ... ```) block.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidates.push(fenced[1].trim());

  // Last resort: the first {...} object embedded anywhere in the text.
  const braced = trimmed.match(/\{[\s\S]*\}/);
  if (braced) candidates.push(braced[0]);

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      // A JSON array/number/string is not a profile object — keep looking.
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return {};
}
