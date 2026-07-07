// Boldness levels come straight from the (untrusted) AI profile extraction.
// The prompt asks for "low"/"medium"/"high", but the model does not always
// comply — it may return "High", "  low ", "Medium", etc. Looking the raw
// value up in a case-sensitive map silently misses, so a "High" user would get
// the neutral medium (yellow) colour while the label still reads "High": the
// badge colour, which is the whole point of the badge, no longer matches the
// text. Normalise the value for the colour lookup while preserving the
// original text for display.

const LOW = "bg-blue-100 text-blue-700";
const MEDIUM = "bg-yellow-100 text-yellow-700";
const HIGH = "bg-red-100 text-red-700";

/**
 * Resolves the display label and Tailwind colour classes for a boldness badge.
 *
 * - The colour is matched case-insensitively and whitespace-tolerantly, so
 *   "High", " high ", and "high" all render red.
 * - An unknown or empty value falls back to the neutral "medium" colour.
 *   (Matching is done with explicit comparisons rather than an object lookup so
 *   untrusted keys like "constructor" cannot resolve to a prototype value.)
 * - The label preserves the original (trimmed) text the AI produced; an
 *   empty/whitespace value falls back to the literal "medium".
 */
export function getBoldnessBadge(level?: string | null): {
  label: string;
  className: string;
} {
  const raw = (level ?? "").trim();
  const key = raw.toLowerCase();

  let className: string;
  if (key === "low") className = LOW;
  else if (key === "high") className = HIGH;
  else className = MEDIUM;

  return { label: raw || "medium", className };
}
