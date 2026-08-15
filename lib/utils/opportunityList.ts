/**
 * Extracts the array of generated opportunities from an untrusted AI response.
 *
 * The model is asked for a bare JSON array, but in practice it sometimes:
 *  - returns exactly that (the happy path),
 *  - wraps the array in markdown code fences or surrounding prose,
 *  - or wraps it in an object, e.g. `{ "opportunities": [...] }`.
 *
 * A plain `JSON.parse` followed by an `Array.isArray` check fails the last
 * case entirely: the parse succeeds (it's a valid object), the array check
 * fails, and generation errors out even though a perfectly good array was
 * right there. This helper recovers the array in all three shapes and returns
 * an empty array when nothing usable is found, so callers can treat "empty"
 * as the single "no opportunities" outcome.
 */
export function parseOpportunityList<T = unknown>(text: string): T[] {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return [];

  // 1. Try to parse the whole response as JSON.
  const direct = tryParse(trimmed);
  if (Array.isArray(direct)) return direct as T[];

  // 2. If it parsed to an object, use an array-valued property (covers
  //    { opportunities: [...] } and similar wrappers). Prefer the first
  //    NON-EMPTY array so a stray empty property (e.g. { meta: [], items: [...] })
  //    doesn't shadow the real payload; fall back to the first array so a
  //    genuinely empty result still parses.
  if (direct && typeof direct === "object") {
    const arrays = Object.values(direct as Record<string, unknown>).filter(
      (v): v is unknown[] => Array.isArray(v)
    );
    const nested = arrays.find((a) => a.length > 0) ?? arrays[0];
    if (Array.isArray(nested)) return nested as T[];
  }

  // 3. Fall back to extracting the first bracketed array from the raw text
  //    (covers code fences / prose around a bare array).
  const match = trimmed.match(/\[[\s\S]*\]/);
  if (match) {
    const extracted = tryParse(match[0]);
    if (Array.isArray(extracted)) return extracted as T[];
  }

  return [];
}

function tryParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
