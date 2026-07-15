// Tailwind classes for each confidence bucket shown on a discovered-email badge.
const CONFIDENCE_CLASSES: Record<"high" | "medium" | "low", string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
};

/**
 * Returns the Tailwind badge classes for an AI-reported confidence value.
 *
 * The confidence comes straight from an untrusted model response, so it may be
 * mis-cased ("High"), padded ("  low "), or an unexpected word. A raw
 * `map[confidence]` lookup would return `undefined` for any of those, rendering
 * an unstyled/invisible badge. Normalize the value and fall back to the neutral
 * "medium" styling so the badge is always visibly rendered.
 */
export function confidenceBadgeClass(confidence: unknown): string {
  const key = typeof confidence === "string" ? confidence.trim().toLowerCase() : "";
  if (key === "high" || key === "medium" || key === "low") {
    return CONFIDENCE_CLASSES[key];
  }
  return CONFIDENCE_CLASSES.medium;
}
