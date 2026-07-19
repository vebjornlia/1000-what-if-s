/**
 * Extracts the array of generated opportunities from an untrusted AI response.
 *
 * The model is asked for a bare JSON array, but in practice it may:
 *  - return a clean array (the happy path),
 *  - wrap the array in an object, e.g. `{"opportunities": [...]}` or
 *    `{"what_ifs": [...]}` (valid JSON, but `Array.isArray` is false),
 *  - surround the JSON with prose / markdown fences so `JSON.parse` throws.
 *
 * Callers previously only handled the first and third cases; an object wrapper
 * parsed successfully but then failed the `Array.isArray` check, so a whole
 * generation batch was discarded. This helper recovers the array in all three
 * cases and always returns an array (empty when nothing usable is found), so the
 * caller never has to try/catch or re-check the shape.
 */
export function extractOpportunities(text: unknown): unknown[] {
  if (typeof text !== "string") return [];

  const fromParsed = coerceToArray(tryParse(text));
  if (fromParsed) return fromParsed;

  // Fall back to slicing out the first bracketed array (handles prose/fences
  // around the JSON, e.g. ```json [ ... ] ```).
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    const fromSlice = coerceToArray(tryParse(match[0]));
    if (fromSlice) return fromSlice;
  }

  return [];
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Returns the value as an array, unwrapping a single object wrapper by taking
 * its first array-valued property. Returns null when no array can be found.
 */
function coerceToArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}
