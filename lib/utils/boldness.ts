// The profile-extraction model is instructed to return boldness_level as one
// of "low" | "medium" | "high", but it frequently mis-cases or pads the value
// ("High", " medium ", "HIGH"). A case-sensitive lookup then misses and the
// badge silently falls back to the medium (yellow) styling while still showing
// the raw text — so a "high" person renders with the wrong colour. Normalize
// the value before deciding both the label and the badge class.

export type BoldnessLevel = "low" | "medium" | "high";

const BOLDNESS_CLASSES: Record<BoldnessLevel, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

/**
 * Coerce an untrusted boldness value to a known level. Anything that is not a
 * recognised level (missing, blank, unexpected word) falls back to "medium".
 */
export function normalizeBoldness(level: unknown): BoldnessLevel {
  if (typeof level === "string") {
    const l = level.trim().toLowerCase();
    if (l === "low" || l === "medium" || l === "high") return l;
  }
  return "medium";
}

/** Tailwind classes for the boldness badge, robust to model mis-casing. */
export function boldnessBadgeClass(level: unknown): string {
  return BOLDNESS_CLASSES[normalizeBoldness(level)];
}
