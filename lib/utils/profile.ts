import type { Profile } from "@/components/onboarding/ProfileReview";

// Fields the ProfileReview UI renders as tag lists. Each MUST be a string[]:
// the component calls tags.map() / tags.join() on them, so any non-array value
// throws a TypeError and blanks the whole review screen.
const ARRAY_FIELDS = [
  "skills",
  "interests",
  "goals",
  "edge_factors",
  "opportunity_types",
] as const;

// Coerce one untrusted value into a clean string[]. Arrays are filtered to
// their string/number members; a bare comma-separated string is split; anything
// else (null, object, number, undefined) becomes an empty array.
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (v): v is string | number =>
          typeof v === "string" || typeof v === "number"
      )
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Normalize an AI-extracted profile so the review UI can render it safely.
 *
 * The profile JSON comes straight from the model and is untrusted: the prompt
 * asks for arrays (skills, interests, ...) but the model sometimes returns a
 * comma-separated string, null, or omits the field entirely. ProfileReview
 * calls `tags.map()` / `tags.join()` on those fields, so a non-array value
 * throws a TypeError and blanks the entire onboarding review. This coerces
 * every tag field to a clean string[], leaving all other fields untouched.
 */
export function normalizeProfile(raw: unknown): Profile {
  const base: Record<string, unknown> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};

  for (const field of ARRAY_FIELDS) {
    base[field] = toStringArray(base[field]);
  }

  return base as Profile;
}
