/**
 * Extracts a JSON array from an untrusted LLM response.
 *
 * The model is asked to return "ONLY a JSON array", but in practice it may:
 *  - return a raw array (the happy path),
 *  - wrap the array in an object (e.g. `{ "candidates": [...] }`),
 *  - fence it in markdown or surround it with prose.
 *
 * Plain `JSON.parse` handles only the first case: for a wrapped object it
 * succeeds but yields a non-array, so downstream array logic silently drops
 * every entry. This helper recovers the array in all of the above shapes and
 * never throws — it returns `[]` when no array can be found.
 */
export function extractJsonArray(text: unknown): unknown[] {
  if (typeof text !== "string" || text.trim() === "") return [];

  // 1) Try to parse the whole payload and coerce it to an array (handles a
  //    raw array as well as an object that wraps one).
  const whole = coerceToArray(tryParse(text.trim()));
  if (whole) return whole;

  // 2) Fall back to pulling the first [...] block out of prose / markdown.
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    const inner = coerceToArray(tryParse(match[0]));
    if (inner) return inner;
  }

  return [];
}

function tryParse(source: string): unknown {
  try {
    return JSON.parse(source);
  } catch {
    return undefined;
  }
}

function coerceToArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  // The model sometimes wraps the array in an object; return the first
  // array-valued property (e.g. { candidates: [...] }).
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) {
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}
