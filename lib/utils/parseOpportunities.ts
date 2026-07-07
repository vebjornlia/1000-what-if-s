// Extracts the JSON array of generated opportunities from a raw LLM response.
//
// The generation prompt asks for a bare JSON array, but models routinely
// deviate in three ways, and the deck goes empty if we don't tolerate them:
//   1. wrap the array in a markdown code fence (```json ... ```),
//   2. return valid JSON that is an *object* wrapping the array
//      (e.g. { "opportunities": [...] } or { "data": [...] }), or
//   3. add prose before/after the JSON.
//
// A plain `JSON.parse` only recovers case (3) (via a catch + regex); case (2)
// parses successfully to a non-array and would otherwise be discarded. This
// helper returns the first plausible array found, or [] if none — it never
// throws.
export function extractOpportunities(text: unknown): unknown[] {
  if (typeof text !== "string") return [];

  // 1. Direct parse — handles a clean array or an array-wrapping object.
  const direct = coerceArray(tryParse(text));
  if (direct) return direct;

  // 2. Fallback: pull the first [...] block out of surrounding prose/fences.
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    const fromMatch = coerceArray(tryParse(match[0]));
    if (fromMatch) return fromMatch;
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

// Returns the array if `value` is an array or an object whose first
// array-valued property is one; otherwise null.
function coerceArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}
