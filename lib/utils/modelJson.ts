// Language models are asked to reply with "ONLY a JSON array, no markdown", but
// in practice they often wrap it in ```json fences, prepend reasoning, or emit
// slightly malformed output. This helper recovers the payload defensively so a
// noisy model response can never throw and crash the request handler.

/**
 * Parses a model's text response, tolerating the common ways an LLM deviates
 * from "return only JSON".
 *
 * Strategy:
 *   1. Try to parse the whole response as JSON (the happy path).
 *   2. On failure, extract the first `[` … last `]` slice and parse that,
 *      which strips surrounding prose or markdown fences.
 *
 * Every `JSON.parse` is guarded, so unrecoverable/garbled output yields an
 * empty array rather than a thrown exception. The return type is `unknown`
 * because a model can return a non-array (e.g. an object or a bare value);
 * callers are expected to validate the shape (e.g. with `Array.isArray`).
 *
 * @param text Raw `message.content` from the model (defaults handled by caller).
 * @returns The parsed value, or `[]` when nothing usable could be recovered.
 */
export function parseModelJson(text: string): unknown {
  if (typeof text !== "string") return [];

  // 1. Happy path: the response is already valid JSON.
  try {
    return JSON.parse(text);
  } catch {
    // fall through to slice-based extraction
  }

  // 2. Fallback: pull out the first bracketed span and parse just that.
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // malformed slice — treat as unrecoverable
    }
  }

  return [];
}
