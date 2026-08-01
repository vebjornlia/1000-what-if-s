/**
 * Returns true when `pathname` falls inside one of the protected app sections.
 *
 * Matching is done on path *segment boundaries*, not a raw prefix: a protected
 * entry `/deck` matches `/deck` and `/deck/anything`, but NOT an unrelated
 * route such as `/decks`, `/dashboard-preview`, or `/profiles`. A plain
 * `pathname.startsWith(p)` check treats those look-alike routes as protected
 * and wrongly bounces visitors to the login page (or into the onboarding
 * profile check), even though they are not one of the app's guarded sections.
 */
export function isProtectedPath(
  pathname: string,
  protectedPaths: readonly string[]
): boolean {
  return protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}
