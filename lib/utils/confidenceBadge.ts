// Confidence badges render an AI-supplied field (`discovered_emails[].confidence`)
// that is UNTRUSTED: resolveBestEmail only validates the `email`, never the
// confidence, so the value may be miscased ("High"), unexpected ("very high"),
// or missing entirely. A raw object lookup on such a value yields `undefined`,
// which strips the badge's color classes and leaks the raw string into the UI.
// Normalize to a known level and always return a concrete Tailwind class.

export type ConfidenceLevel = "high" | "medium" | "low";

const CONFIDENCE_CLASSES: Record<ConfidenceLevel, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
};

// Neutral fallback for anything the AI returns that we don't recognize. We
// deliberately do NOT invent a level ("medium") — that would misreport the AI's
// confidence. A gray badge labelled "unknown" is honest and still styled.
const UNKNOWN_LABEL = "unknown";
const UNKNOWN_CLASS = "bg-gray-100 text-gray-700";

/** Coerce an untrusted confidence value to a known level, or null if unknown. */
export function normalizeConfidence(value: unknown): ConfidenceLevel | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return key in CONFIDENCE_CLASSES ? (key as ConfidenceLevel) : null;
}

/** Tailwind badge classes for a confidence value; neutral gray when unknown. */
export function confidenceBadgeClass(value: unknown): string {
  const level = normalizeConfidence(value);
  return level ? CONFIDENCE_CLASSES[level] : UNKNOWN_CLASS;
}

/** Display label for a confidence value; "unknown" (gray) when unrecognized. */
export function confidenceLabel(value: unknown): string {
  return normalizeConfidence(value) ?? UNKNOWN_LABEL;
}
