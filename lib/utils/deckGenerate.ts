/**
 * Decide whether the deck should kick off an automatic "generate first batch"
 * run in response to the `?generate=true` query flag.
 *
 * The flag is set exactly once, when the user finishes onboarding
 * (`router.push("/deck?generate=true")`). Auto-generation must happen a single
 * time:
 *  - not while a generation is already in flight (`generating`), and
 *  - not again after the very first trigger of this component instance
 *    (`alreadyTriggered`).
 *
 * The stale `?generate=true` left in the URL is the real hazard: a page reload
 * re-mounts the deck with a fresh in-memory guard, so without also stripping the
 * flag from the URL the guard alone cannot stop a second, wasteful batch from
 * being generated. Callers should strip the flag once this returns true.
 */
export function shouldAutoGenerate(params: {
  generateFlag: string | null;
  alreadyTriggered: boolean;
  generating: boolean;
}): boolean {
  const { generateFlag, alreadyTriggered, generating } = params;
  return generateFlag === "true" && !alreadyTriggered && !generating;
}
