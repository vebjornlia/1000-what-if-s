/**
 * Recovers the structured user profile object from a raw model response.
 *
 * The model is told to return only JSON, but in practice it may wrap the object
 * in markdown code fences, add prose before/after it, nest it under a key like
 * `{ "profile": {...} }`, or return something that is not valid JSON at all.
 *
 * This parser is deliberately defensive: it NEVER throws and returns `{}` when
 * no object can be recovered. The previous inline parser called `JSON.parse` on
 * a regex-extracted substring inside a `catch` block, so a malformed extract
 * threw again, escaped the handler, and turned into a 500 — which blanked the
 * onboarding review screen. Degrading to an empty profile keeps that flow alive.
 */
export function parseProfile(text: unknown): Record<string, unknown> {
  if (typeof text !== "string") return {};

  const parsed =
    tryParseObject(text) ??
    tryParseObject(stripCodeFences(text)) ??
    tryParseObject(extractFirstObject(text));

  if (!parsed) return {};
  return unwrapProfile(parsed);
}

function tryParseObject(source: string | null): Record<string, unknown> | null {
  if (!source) return null;
  try {
    const value = JSON.parse(source);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    // Not valid JSON — let the caller try the next strategy.
  }
  return null;
}

function stripCodeFences(source: string): string {
  return source.replace(/```(?:json)?/gi, "").trim();
}

function extractFirstObject(source: string): string | null {
  const match = source.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

// Some responses nest the real profile under a `profile` key. Only treat it as
// a wrapper when `profile` is the sole key holding an object, so a genuine
// profile that merely carries a stray `profile` field is never discarded.
function unwrapProfile(obj: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(obj);
  const inner = obj.profile;
  if (
    keys.length === 1 &&
    keys[0] === "profile" &&
    inner &&
    typeof inner === "object" &&
    !Array.isArray(inner)
  ) {
    return inner as Record<string, unknown>;
  }
  return obj;
}
