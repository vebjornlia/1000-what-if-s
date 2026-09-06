// Maps a profile's boldness level to a display label + Tailwind badge classes.
//
// The AI profile extraction is prompted for "low/medium/high", but a model
// can easily return a different case ("High"), stray whitespace (" high "),
// or an off-vocabulary word ("very bold"). The old inline lookup keyed the
// color map on the raw string, so anything but an exact lowercase match
// silently fell back to the medium (yellow) color — rendering a genuinely
// bold user as "medium". Normalize before the color lookup so casing and
// whitespace no longer break it, while preserving the original text as the
// visible label.

export interface BoldnessBadge {
  label: string;
  className: string;
}

const COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export function boldnessBadge(level: string | null | undefined): BoldnessBadge {
  const raw = (level ?? "").trim();
  const normalized = raw.toLowerCase();
  return {
    label: raw || "medium",
    className: COLORS[normalized] ?? COLORS.medium,
  };
}
