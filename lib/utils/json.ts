/**
 * Extracts a JSON array from a raw LLM completion.
 *
 * Models frequently wrap JSON in prose or markdown code fences, so a direct
 * `JSON.parse` of the whole response is not enough. We try a direct parse
 * first, then fall back to the first bracketed `[...]` span in the text. Both
 * parse attempts are guarded, so a malformed or truncated response never
 * throws — the caller always gets either an array or `null`.
 *
 * Returns `null` when no JSON array can be recovered, letting callers
 * distinguish an unparseable response from a legitimately empty array (`[]`).
 */
export function parseJsonArray(text: string): unknown[] | null {
  const direct = tryParse(text);
  if (Array.isArray(direct)) return direct;

  // Fall back to the first [...] span (handles prose / markdown-fenced output).
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    const extracted = tryParse(match[0]);
    if (Array.isArray(extracted)) return extracted;
  }

  return null;
}

function tryParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
