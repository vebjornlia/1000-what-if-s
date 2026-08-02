/** The subset of a Supabase mutation error we surface to the user. */
export interface SaveError {
  message?: string;
}

export interface SaveResult {
  ok: boolean;
  message: string;
}

/**
 * Maps the outcome of a Supabase profile write to a user-facing result.
 *
 * Supabase write calls RESOLVE (they do not throw) on failure, returning
 * `{ error }`; a null/undefined error means the write succeeded. Reporting
 * success without consulting this makes a failed save look successful — the
 * user believes their edits were stored when they were silently dropped.
 */
export function profileSaveResult(
  error: SaveError | null | undefined
): SaveResult {
  if (error) {
    const detail = error.message?.trim();
    return {
      ok: false,
      message: detail
        ? `Couldn't save your profile: ${detail}`
        : "Couldn't save your profile. Please try again.",
    };
  }
  return { ok: true, message: "Profile saved!" };
}
