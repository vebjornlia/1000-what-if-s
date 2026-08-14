// Interprets the outcome of a "save profile" attempt so the UI can tell the
// user the truth. The profile edit page used to alert "Profile saved!"
// unconditionally — even when the Supabase update returned an error, or when
// there was no signed-in user and the write was never attempted. That made
// silent data loss look like success.
//
// This helper takes a Supabase-style result ({ error }) and returns a plain
// outcome: whether the save actually succeeded and the message to show.

export interface SaveResultInput {
  // A Supabase write returns an `error` that is null on success and a
  // PostgrestError (with a `message`) on failure. Pass `null`/`undefined` when
  // the write was never attempted (e.g. no authenticated user).
  error?: { message?: string | null } | null;
}

export interface SaveOutcome {
  ok: boolean;
  message: string;
}

export function profileSaveResult(
  result: SaveResultInput | null | undefined
): SaveOutcome {
  const error = result?.error;
  if (error) {
    const detail =
      typeof error.message === "string" ? error.message.trim() : "";
    return {
      ok: false,
      message: detail
        ? `Couldn't save your profile: ${detail}`
        : "Couldn't save your profile. Please try again.",
    };
  }
  return { ok: true, message: "Profile saved!" };
}
