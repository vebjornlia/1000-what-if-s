export type ConfidenceLevel = "high" | "medium" | "low";

// Tailwind classes for each recognized confidence level.
const CONFIDENCE_CLASSES: Record<ConfidenceLevel, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
};

// Neutral styling for anything we can't map to a known level, so the badge
// still renders with a visible background instead of an empty class string.
const FALLBACK_CLASS = "bg-gray-100 text-gray-700";

/**
 * Normalizes an AI-provided confidence value to a known level.
 *
 * The value is untrusted: the model may return "High", " LOW ", or a
 * non-string entirely. Lower-cases and trims before matching; returns null for
 * anything that isn't one of the three recognized levels.
 */
export function normalizeConfidence(value: unknown): ConfidenceLevel | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "high" || v === "medium" || v === "low") return v;
  return null;
}

/**
 * Maps an (untrusted) confidence value to a badge class. Falls back to neutral
 * styling for unrecognized values so a mis-cased level never yields an empty
 * `undefined` class and an unstyled badge.
 */
export function confidenceClass(value: unknown): string {
  const level = normalizeConfidence(value);
  return level ? CONFIDENCE_CLASSES[level] : FALLBACK_CLASS;
}

/**
 * Display label for a confidence value: the normalized level, or "unknown"
 * when it can't be recognized. Keeps the UI consistent regardless of AI casing.
 */
export function confidenceLabel(value: unknown): string {
  return normalizeConfidence(value) ?? "unknown";
}
