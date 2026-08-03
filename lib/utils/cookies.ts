/**
 * Builds a `document.cookie` string that immediately expires (deletes) a
 * client-readable cookie.
 *
 * `max-age=0` (with the matching `path`) instructs the browser to drop the
 * cookie right away. Use this to invalidate cached, non-httpOnly flags — such
 * as the `x-has-profile` profile-cache cookie — on auth transitions so a stale
 * value from a previous session can't leak into the next one.
 *
 * @param name Cookie name to expire.
 * @param path Cookie path (defaults to "/"). Must match the path the cookie
 *             was set with, or the browser will keep the original cookie.
 */
export function expireCookie(name: string, path: string = "/"): string {
  return `${name}=; path=${path}; max-age=0`;
}
