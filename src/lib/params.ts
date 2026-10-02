/**
 * Next.js gives `string[]` when a query key repeats (`?q=a&q=b`).
 * Pages only ever want one value, so take the first.
 */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>
