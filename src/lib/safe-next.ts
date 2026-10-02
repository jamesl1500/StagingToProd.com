/** Only allow redirects back into this site (no `//evil.com` or absolute URLs). */
export function safeNext(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}
