/**
 * Normalizes the raw, parsed AI response from email discovery into a flat array
 * of candidate objects.
 *
 * The email-discovery prompt asks for a bare JSON array, but models — especially
 * the cheap free-tier model used for this task — routinely wrap the array in an
 * object, e.g. {"candidates": [...]}, {"emails": [...]}, or {"results": [...]}.
 * When that happens the value handed to `resolveBestEmail` is not an array, so
 * every discovered email is silently dropped and discovery reports "not_found"
 * even though the model actually returned usable addresses.
 *
 * This unwraps the common wrapper shapes and always returns an array (possibly
 * empty). A single bare candidate object (not inside an array) is also tolerated.
 * It never throws — malformed / unexpected input yields an empty array so the
 * caller can fall back to "not_found" gracefully.
 */
const WRAPPER_KEYS = ["candidates", "emails", "results", "data", "items"] as const;

export function extractEmailCandidates(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;

    // Common keys a model might wrap the candidate array under.
    for (const key of WRAPPER_KEYS) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }

    // A single candidate object with an email field → treat as a one-item list.
    if (typeof obj.email === "string") return [obj];
  }

  return [];
}
