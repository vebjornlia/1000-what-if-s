// Common keys a model uses when it (wrongly) wraps the candidate array in an
// object instead of returning a bare array, e.g. { "candidates": [...] }.
const WRAPPER_KEYS = ["candidates", "emails", "results", "items", "data"];

// Pull an array out of a parsed value: the value itself if it's already an
// array, otherwise the first array-valued property of an object (preferring a
// known wrapper key). Returns null when no array can be found.
function extractArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  const obj = value as Record<string, unknown>;
  for (const key of WRAPPER_KEYS) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) return v;
  }
  return null;
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Extracts the candidate array from an untrusted model response.
 *
 * The cheap discovery model does not reliably return a bare JSON array as
 * asked: it may fence the JSON in markdown, or wrap the array in an object
 * ({ "candidates": [...] }). A plain JSON.parse of such an object succeeds but
 * yields a non-array, which downstream code treats as "no emails found" —
 * silently discarding real, discovered contacts.
 *
 * This normalizes all those shapes to an array (empty when nothing usable is
 * present). It never throws.
 */
export function parseCandidateArray(raw: unknown): unknown[] {
  if (typeof raw !== "string") return [];
  const text = raw.trim();
  if (!text) return [];

  // 1. Parse the whole response and unwrap an object if needed.
  const fromDirect = extractArray(tryParse(text));
  if (fromDirect) return fromDirect;

  // 2. Fall back to the first bracketed block (handles markdown fences and
  //    surrounding prose around either a bare array or a wrapped one).
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    const sub = tryParse(match[0]);
    if (Array.isArray(sub)) return sub;
  }

  return [];
}
