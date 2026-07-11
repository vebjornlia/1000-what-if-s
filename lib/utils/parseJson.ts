/**
 * Best-effort recovery of a JSON OBJECT from a possibly-messy LLM response.
 *
 * The model is untrusted: it may return raw JSON, JSON wrapped in markdown
 * code fences, or a valid object surrounded by prose. It may also return
 * something that parses but is not an object (an array, a bare string, a
 * number, or null). Callers must never crash the flow on such output, so this
 * returns the parsed object on success and `null` otherwise — never throws.
 *
 * @param text raw text content from the model
 * @returns the parsed plain object, or null if none can be recovered
 */
export function parseJsonObject(text: unknown): Record<string, unknown> | null {
  if (typeof text !== "string") return null;

  const asObject = (value: unknown): Record<string, unknown> | null =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;

  const tryParse = (s: string): Record<string, unknown> | null => {
    try {
      return asObject(JSON.parse(s));
    } catch {
      return null;
    }
  };

  // 1. Try the whole string as-is.
  const direct = tryParse(text.trim());
  if (direct) return direct;

  // 2. Fall back to the first `{ ... }` span (handles code fences / prose).
  const match = text.match(/\{[\s\S]*\}/);
  return match ? tryParse(match[0]) : null;
}
