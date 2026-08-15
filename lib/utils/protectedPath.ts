/**
 * Decide whether a request pathname falls under one of the protected route
 * prefixes.
 *
 * Matches on whole path SEGMENTS: a prefix like "/deck" guards "/deck" and
 * "/deck/anything", but NOT an unrelated sibling such as "/deckhouse". A naive
 * `pathname.startsWith(p)` would treat any path that merely begins with the
 * string as protected — so a future public route like "/profiles" or
 * "/deck-demo" would be wrongly force-redirected to login. Segment matching
 * keeps the auth boundary tied to the actual route tree.
 *
 * Behaviour is identical to the old prefix check for every real route in the
 * app today (all protected paths and their children still match); it only
 * stops false matches on sibling paths that share a leading substring.
 */
export function isProtectedPath(
  pathname: string,
  protectedPaths: string[]
): boolean {
  return protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}
