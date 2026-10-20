import type { CurrencyCode } from '~/components/currencies/types'

/**
 * Picker order: currencies of the user's wallets first (more wallets, then a larger total in the base currency),
 * then the user's custom and edited ones, then the rest by code.
 */
export function orderCurrencies(
  codes: readonly CurrencyCode[],
  walletCurrencies: Readonly<Record<CurrencyCode, { count: number, total: number }>>,
  ownCodes: ReadonlySet<CurrencyCode>,
): CurrencyCode[] {
  const rank = (code: CurrencyCode) => walletCurrencies[code] ? 0 : ownCodes.has(code) ? 1 : 2
  return [...new Set(codes)].sort((a, b) => {
    const byRank = rank(a) - rank(b)
    if (byRank)
      return byRank
    const wa = walletCurrencies[a]
    const wb = walletCurrencies[b]
    if (wa && wb)
      return wb.count - wa.count || wb.total - wa.total || a.localeCompare(b)
    return a.localeCompare(b)
  })
}

/** Case-insensitive match over code and name. */
export function matchesCurrency(search: string, code: CurrencyCode, name: string): boolean {
  const query = search.trim().toLowerCase()
  return !query || code.toLowerCase().includes(query) || name.toLowerCase().includes(query)
}

/** A rate with enough decimals to stay readable: tiny rates (a weak currency in a strong base) keep more digits. */
export function formatRate(rate: number): string {
  return rate.toFixed(rate < 0.01 ? 6 : rate < 1 ? 4 : 2)
}
