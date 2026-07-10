/**
 * Parses the email-discovery model response into a flat array of candidate
 * objects.
 *
 * The model is instructed to return a JSON array, but real responses vary:
 * they may be a bare array, an array wrapped in prose, or — critically — a
 * JSON object that nests the array under some key (e.g. `{"candidates": [...]}`).
 * In that last case `JSON.parse` SUCCEEDS and yields an object, so a naive
 * caller passes a non-array on to `resolveBestEmail`, which then finds no
 * emails and reports "not_found" — silently discarding every candidate the
 * model actually produced.
 *
 * This helper always returns an array: it parses the text (falling back to the
 * first bracketed span if the whole string isn't valid JSON) and, when the
 * result is an object, digs out the first array-valued property. It never
 * throws; on anything unrecognizable it returns an empty array.
 */
export function parseEmailCandidates(text: string): unknown[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return [];
    }
  }

  return coerceToArray(parsed);
}

function coerceToArray(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    // The array is nested under some key — return the first array we find.
    for (const value of Object.values(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}
