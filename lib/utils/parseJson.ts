/**
 * Safely parses a JSON object out of untrusted model output.
 *
 * The model may return raw JSON, JSON wrapped in prose or markdown code
 * fences, or malformed text (e.g. unquoted keys). We try a direct parse
 * first, then fall back to extracting the first `{ ... }` span and parsing
 * that. Every failure path yields an empty object instead of throwing, so a
 * caller (such as the onboarding profile extraction) always receives a usable
 * object rather than crashing the request with a 500.
 *
 * Arrays and non-object JSON values are treated as "no object" and coalesce to
 * `{}`, since callers expect to read named fields off the result.
 */
export function parseJsonObject(text: unknown): Record<string, unknown> {
  if (typeof text !== "string") return {};
  const trimmed = text.trim();
  if (!trimmed) return {};

  const asObject = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;

  try {
    const direct = asObject(JSON.parse(trimmed));
    if (direct) return direct;
  } catch {
    // fall through to span extraction
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const extracted = asObject(JSON.parse(match[0]));
      if (extracted) return extracted;
    } catch {
      // fall through to empty-object default
    }
  }

  return {};
}
