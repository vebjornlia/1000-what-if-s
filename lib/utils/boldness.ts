// Badge colors for a profile's boldness level. The AI fills `boldness_level`
// as free text, so it may arrive with unexpected casing or surrounding
// whitespace ("High", "HIGH", " high "). A raw keyed lookup misses those and
// silently falls back to the medium (yellow) color even though the label still
// reads "High" — a visible mismatch. Normalize before looking up.

const BOLDNESS_CLASSES: Record<"low" | "medium" | "high", string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

/**
 * Returns the badge classes for a boldness level, tolerant of casing and
 * whitespace. Unknown or missing values fall back to the medium color, matching
 * the prior default.
 */
export function boldnessClass(level: unknown): string {
  const key = typeof level === "string" ? level.trim().toLowerCase() : "";
  if (key === "low" || key === "medium" || key === "high") {
    return BOLDNESS_CLASSES[key];
  }
  return BOLDNESS_CLASSES.medium;
}
