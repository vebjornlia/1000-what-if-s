/**
 * Recover the array of generated opportunities from a raw model completion.
 *
 * The generation model is asked for a bare JSON array, but in practice it
 * sometimes wraps the array in a markdown code fence or in an object such as
 * `{ "opportunities": [...] }`. The original inline parser only recovered a
 * bare `[...]` block AFTER a failed `JSON.parse`, so an object-wrapped array
 * parsed cleanly as a non-array and the whole request 500'd with
 * "AI returned no opportunities" — leaving the user's deck empty. This helper
 * handles those shapes defensively while preserving the previous behaviour for
 * the cases that already worked.
 *
 * Returns the parsed array (which may be empty), or `null` when no array
 * structure could be recovered at all — letting the caller distinguish an
 * unparseable response from a genuinely empty one.
 */
export function parseOpportunities(text: unknown): unknown[] | null {
  if (typeof text !== "string" || text.trim() === "") return null;

  const cleaned = stripCodeFences(text).trim();

  const direct = tryParse(cleaned);
  if (direct !== undefined) {
    const arr = coerceToArray(direct);
    if (arr) return arr;
  }

  // Last resort: pull the first bracketed block out of the text (handles
  // prose or fences around an otherwise-valid array).
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    const parsed = tryParse(match[0]);
    if (Array.isArray(parsed)) return parsed;
  }

  return null;
}

function stripCodeFences(text: string): string {
  // Strip a leading ```json / ``` fence and a trailing ``` fence if present.
  return text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "");
}

function tryParse(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function coerceToArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  // Some models wrap the array in an object, e.g. { opportunities: [...] }.
  // Return the first array-valued property found.
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}
