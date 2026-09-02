// Keys the model has been observed to wrap the opportunity array in, tried in
// priority order before falling back to "first array-valued property".
const ARRAY_KEYS = [
  "opportunities",
  "what_ifs",
  "whatIfs",
  "cards",
  "items",
  "results",
  "data",
] as const;

/**
 * Unwraps the array of generated opportunities from a parsed AI response.
 *
 * The model is told to return a bare JSON array, but it sometimes wraps the
 * array in an object (e.g. { "opportunities": [...] } or { "data": [...] }).
 * That object is valid JSON, so a plain `Array.isArray` check treated it as
 * "AI returned no opportunities" and every generation failed. Here we accept
 * a bare array, an array nested under a known key, or — as a last resort — the
 * first array-valued property on the object.
 *
 * The parsed input is untrusted; anything that is not (or does not contain) an
 * array yields an empty list so the caller can fail cleanly.
 */
export function extractOpportunities<T = unknown>(parsed: unknown): T[] {
  if (Array.isArray(parsed)) return parsed as T[];

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const key of ARRAY_KEYS) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return value as T[];
    }
  }

  return [];
}
