export type BoldnessKey = "low" | "medium" | "high";

// Badge styling per canonical boldness level.
export const BOLDNESS_BADGE_CLASSES: Record<BoldnessKey, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

/**
 * Resolves the boldness badge (color + label) for a profile's `boldness_level`.
 *
 * The value is AI-generated and untrusted: it may be missing, non-string, or a
 * variant like "High", "HIGH", or "very high". A raw keyed lookup only matches
 * exact lowercase "low"/"medium"/"high", so any variant silently fell back to
 * the yellow *medium* color while the label still read (e.g.) "High" — a
 * color/label mismatch. Normalize case-insensitively so the color always
 * matches the level, defaulting to "medium" only when nothing recognizable is
 * present.
 */
export function boldnessBadge(level: unknown): {
  key: BoldnessKey;
  label: string;
  className: string;
} {
  const raw = typeof level === "string" ? level.trim() : "";
  const lower = raw.toLowerCase();

  let key: BoldnessKey = "medium";
  if (lower.includes("low")) key = "low";
  else if (lower.includes("high")) key = "high";

  return {
    key,
    label: raw || "medium",
    className: BOLDNESS_BADGE_CLASSES[key],
  };
}
