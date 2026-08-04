// Decide whether the onboarding profile save actually succeeded.
//
// Supabase's `.upsert()` does NOT throw on failure — it resolves with an
// `{ error }` object — so a try/catch around it will not catch a rejected
// write. Likewise the user may be signed out by the time they confirm. Both
// cases must block navigation to /deck (and the "x-has-profile" cookie),
// otherwise the user lands on an empty deck whose generation fails with
// "No profile found." Callers pass the resolved auth user and the upsert's
// `error` field; this returns whether it's safe to proceed plus a plain,
// user-facing message when it isn't.

export interface ProfileSaveOutcome {
  ok: boolean;
  message: string;
}

export function interpretProfileSave(
  user: { id?: unknown } | null | undefined,
  upsertError: { message?: unknown } | null | undefined
): ProfileSaveOutcome {
  if (!user) {
    return {
      ok: false,
      message: "You're signed out — please sign in again to save your profile.",
    };
  }
  if (upsertError) {
    return {
      ok: false,
      message: "We couldn't save your profile. Please try again.",
    };
  }
  return { ok: true, message: "" };
}
