/**
 * Detects Supabase's "obfuscated user" response that signals a sign-up attempt
 * for an email that already has an account.
 *
 * When email confirmation is enabled, `supabase.auth.signUp` does NOT return an
 * error for an already-registered email — to avoid leaking which addresses
 * exist it returns a fake user with an EMPTY `identities` array and no session.
 * A genuinely new sign-up always comes back with at least one identity. Callers
 * must treat the empty-identities case as "account already exists" instead of
 * routing the person into the app with no session.
 *
 * Defensive by design: only an explicitly empty array counts. A missing/unknown
 * `identities` field returns false so existing happy-path behavior is preserved.
 */
export function isExistingAccountSignup(
  data:
    | { user?: { identities?: unknown[] | null } | null }
    | null
    | undefined
): boolean {
  const identities = data?.user?.identities;
  return Array.isArray(identities) && identities.length === 0;
}
