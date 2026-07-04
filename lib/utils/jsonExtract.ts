/**
 * Safely extract a JSON object from an untrusted LLM response.
 *
 * Model output is untrusted: it may be clean JSON, JSON wrapped in prose or
 * markdown code fences, or something that merely *looks* like it contains an
 * object but is malformed. Callers previously did:
 *
 *     try { obj = JSON.parse(text); }
 *     catch { const m = text.match(/\{[\s\S]*\}/); obj = m ? JSON.parse(m[0]) : {}; }
 *
 * The inner `JSON.parse(m[0])` throws when the matched `{...}` substring is not
 * valid JSON, which escapes the intended `{}` fallback and turns a recoverable
 * parse failure into a 500. This helper never throws: it returns the parsed
 * plain object, or `null` when no valid object can be recovered, so the caller
 * decides the fallback.
 *
 * Only plain objects count — a bare array or primitive is not a profile-shaped
 * object and yields `null`.
 */
export function extractJsonObject(text: unknown): Record<string, unknown> | null {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Fast path: the whole string is valid JSON.
  const direct = tryParseObject(trimmed);
  if (direct) return direct;

  // 2. Fallback: pull out the first `{` through the last `}` and parse that.
  //    Same strategy the inline callers used, but it can never throw.
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  return tryParseObject(trimmed.slice(start, end + 1));
}

function tryParseObject(candidate: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return null;
}
