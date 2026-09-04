/**
 * Decides whether a request pathname belongs to a protected app route.
 *
 * The auth middleware must gate exactly the protected sections and their
 * sub-routes — no more. A naive `pathname.startsWith(p)` prefix check leaks
 * protection onto unrelated routes that merely share a prefix: with
 * "/deck" protected, `startsWith` also matches `/deckhouse` or `/decks-public`,
 * and "/profile" would match `/profiler`. Those false matches would force a
 * login redirect (or profile-existence check) on routes that were never meant
 * to be protected.
 *
 * This matches on path segment boundaries instead: a pathname is protected
 * only when it equals a protected base or continues with a "/" (a real
 * sub-route). Query strings and hashes are not part of `pathname`, so they do
 * not affect the decision.
 */
export function isProtectedPath(pathname: string, protectedPaths: string[]): boolean {
  return protectedPaths.some(
    (base) => pathname === base || pathname.startsWith(base + "/")
  );
}
