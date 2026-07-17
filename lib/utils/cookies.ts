/**
 * Builds a `document.cookie` assignment string that deletes a cookie by
 * expiring it immediately (`max-age=0`).
 *
 * IMPORTANT: a browser only overwrites/deletes a cookie when the `path`
 * matches the path the cookie was originally written with. The app writes
 * `x-has-profile` with `path=/` (see the onboarding flow and profile page), so
 * it must be cleared with `path=/` as well — clearing it under a different
 * (e.g. the current page's) path silently leaves the original cookie in place.
 */
export function expireCookie(name: string, path: string = "/"): string {
  return `${name}=; path=${path}; max-age=0`;
}
