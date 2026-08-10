/**
 * Safely parses a JSON object out of an untrusted AI text response.
 *
 * Language models frequently wrap JSON in prose or markdown code fences, or
 * emit not-quite-valid JSON. The onboarding profile-extraction flow is meant
 * to degrade to an empty profile when that happens — not crash the request.
 *
 * Strategy:
 *   1. Try to parse the whole string as JSON.
 *   2. Otherwise, extract the outermost `{ ... }` span and try to parse that.
 * Every failure path (including a matched-but-invalid span) returns `{}` so
 * callers always get a usable object instead of a thrown error.
 */
export function parseAIObject(text: unknown): Record<string, unknown> {
  if (typeof text !== "string") return {};

  const asObject = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  try {
    return asObject(JSON.parse(text));
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return asObject(JSON.parse(match[0]));
    } catch {
      return {};
    }
  }
}
