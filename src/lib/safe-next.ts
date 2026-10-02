// Placeholder origin used only to resolve `next` the way a browser would.
const BASE = 'http://stagingtoprod.invalid'

/**
 * Only allow redirects back into this site. Resolves the value like a browser
 * so tricks such as `//evil.com`, `/\evil.com` or `/\t/evil.com` can't leave the origin.
 */
export function safeNext(next: unknown, fallback = '/account'): string {
  if (typeof next !== 'string' || !next.startsWith('/')) return fallback
  // Browsers strip tabs and newlines from URLs, which can turn `/\t/x` into `//x`.
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback
  let url: URL
  try {
    url = new URL(next, BASE)
  } catch {
    return fallback
  }
  if (url.origin !== BASE) return fallback
  return `${url.pathname}${url.search}${url.hash}`
}
