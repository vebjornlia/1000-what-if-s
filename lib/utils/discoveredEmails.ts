/**
 * Extracts the array of AI-discovered email candidates from a raw model
 * response.
 *
 * The email-discovery prompt asks for a bare JSON array, but models (especially
 * the cheap/free model used here) frequently wrap it: in an object
 * (`{"candidates": [...]}`), in ```json fences, or in surrounding prose. A plain
 * `JSON.parse` of an object-wrapped response succeeds and returns a NON-array,
 * so the candidates are silently dropped and a genuinely discovered contact is
 * reported as not_found. This normalizes all of those shapes to the underlying
 * array so discovered emails are never lost.
 *
 * Returns `[]` when no array can be recovered; the caller
 * (`resolveBestEmail`) validates each entry, so returning loosely-typed
 * `unknown[]` here is intentional and safe.
 */
export function extractCandidateArray(text: unknown): unknown[] {
  if (typeof text !== "string" || text.trim() === "") return [];

  // 1. Direct parse: a bare array, or an object that wraps the array.
  try {
    const arr = arrayFrom(JSON.parse(text));
    if (arr) return arr;
  } catch {
    // Not valid JSON on its own — fall through to bracket extraction.
  }

  // 2. Bracket extraction: pull the first [...] out of fenced/prose output.
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Malformed bracketed content — give up gracefully.
    }
  }

  return [];
}

/** Returns the candidate array from a parsed value, or null if there is none. */
function arrayFrom(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Prefer a conventionally named field, then any array-valued property.
    for (const key of ["candidates", "emails", "results", "data"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}
