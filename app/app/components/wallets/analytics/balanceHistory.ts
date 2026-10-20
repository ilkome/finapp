import type { CurrencyCode } from '~/components/currencies/types'
import type { Trns } from '~/components/trns/types'
import type { WalletId, WalletItemComputed, Wallets, WalletType } from '~/components/wallets/types'

import { colorsWithoutShades } from '~/components/color/colors'
import { computeWalletCounts } from '~/components/wallets/counts'
import { isCreditProduct, walletTypes } from '~/components/wallets/types'

export type ToBase = (amount: number, currency: CurrencyCode) => number
export type BalanceBreakdown = 'currency' | 'total' | 'type' | 'wallet'
/** `assets` leaves credit cards and loans out, like the wallets page total; `net` subtracts the debts. */
export type BalanceScope = 'assets' | 'net'

export type AnalyticsSeries = {
  color?: string
  data: number[]
  id: string
  name?: string
  /** Value right before the first point: the base of the period change. */
  opening?: number
}

/** One readable colour per series: the 500 shade of every palette hue. */
export const seriesPalette: string[] = colorsWithoutShades.map(group => group[1]!).filter(Boolean)

export const OTHER_SERIES_ID = 'other'

/**
 * Balance of every wallet, in its own currency, at the end of each interval. `ends` must be
 * ascending; a trn counts when its civil day is not after the end. Same sign rules as `getWalletsTotals`.
 */
export function walletBalancesAt(trnsItems: Trns, walletsItems: Wallets, ends: number[]): Record<WalletId, number>[] {
  const moves: { amount: number, date: number, walletId: WalletId }[] = []
  for (const trn of Object.values(trnsItems)) {
    if (trn.toWalletId && walletsItems[trn.toWalletId])
      moves.push({ amount: trn.toAmount!, date: trn.date, walletId: trn.toWalletId })
    if (trn.fromWalletId && walletsItems[trn.fromWalletId])
      moves.push({ amount: -trn.fromAmount!, date: trn.date, walletId: trn.fromWalletId })
  }
  moves.sort((a, b) => a.date - b.date)

  const running: Record<WalletId, number> = {}
  const result: Record<WalletId, number>[] = []
  let index = 0
  for (const end of ends) {
    while (index < moves.length && moves[index]!.date <= end) {
      const move = moves[index]!
      running[move.walletId] = (running[move.walletId] ?? 0) + move.amount
      index++
    }
    result.push({ ...running })
  }
  return result
}

/** Series of the wallets' balances in base currency, one point per interval end. */
export function balanceSeries(params: {
  balances: Record<WalletId, number>[]
  breakdown: BalanceBreakdown
  /** Wallets already filtered to the ones that count (archived / not-in-total switches). */
  maxWallets?: number
  scope: BalanceScope
  toBaseAt: (index: number) => ToBase
  walletIds: WalletId[]
  wallets: Wallets
}): AnalyticsSeries[] {
  const { balances, breakdown, maxWallets = 8, scope, toBaseAt, wallets } = params
  const walletIds = params.walletIds.filter(id => wallets[id] && (scope === 'net' || !isCreditProduct(wallets[id]!.type)))
  const keyOf = (id: WalletId): string => {
    const wallet = wallets[id]!
    return breakdown === 'total' ? 'total' : breakdown === 'type' ? wallet.type : breakdown === 'currency' ? wallet.currencyCode : id
  }

  const series = new Map<string, number[]>()
  balances.forEach((point, index) => {
    const toBase = toBaseAt(index)
    for (const id of walletIds) {
      const key = keyOf(id)
      const data = series.get(key) ?? Array.from<number>({ length: balances.length }).fill(0)
      data[index]! += toBase(point[id] ?? 0, wallets[id]!.currencyCode)
      series.set(key, data)
    }
  })
  if (breakdown === 'total' && !series.size)
    series.set('total', Array.from<number>({ length: balances.length }).fill(0))

  // Largest current balance first, so the stack and the legend read top-down.
  const magnitude = (data: number[]) => Math.abs(data.at(-1) ?? 0)
  let entries = [...series].filter(([, data]) => data.some(value => value !== 0) || breakdown === 'total')
  entries = breakdown === 'type'
    ? entries.sort(([a], [b]) => walletTypes.indexOf(a as WalletType) - walletTypes.indexOf(b as WalletType))
    : entries.sort(([, a], [, b]) => magnitude(b) - magnitude(a))

  if (breakdown === 'wallet' && entries.length > maxWallets) {
    const rest = entries.slice(maxWallets - 1)
    entries = [...entries.slice(0, maxWallets - 1), [OTHER_SERIES_ID, rest.reduce<number[]>((sum, [, data]) => sum.map((value, i) => value + data[i]!), Array.from<number>({ length: balances.length }).fill(0))]]
  }

  return entries.map(([id, data], index) => ({
    color: breakdown === 'wallet' && id !== OTHER_SERIES_ID ? wallets[id]?.color : seriesPalette[index % seriesPalette.length],
    data: data.map(value => Math.round(value)),
    id,
    name: breakdown === 'wallet' && id !== OTHER_SERIES_ID ? wallets[id]?.name : undefined,
  }))
}

/** Series built over (opening point, ...interval ends): the opening value moves out of `data`. */
export function splitOpening(series: AnalyticsSeries[]): AnalyticsSeries[] {
  return series.map(item => ({ ...item, data: item.data.slice(1), opening: item.data[0] ?? 0 }))
}

/** Change for the period: the last point against the balance right before the period. */
export function periodChange(item: AnalyticsSeries): number {
  return (item.data.at(-1) ?? 0) - (item.opening ?? item.data[0] ?? 0)
}

/** Rows of the wallets statistics block (total, available, credit, ...), one point per interval end. */
export function statisticsRowsSeries(params: {
  balances: Record<WalletId, number>[]
  flags: { includeArchived: boolean, includeExcluded: boolean }
  rowIds: string[]
  toBaseAt: (index: number) => ToBase
  walletIds: WalletId[]
  wallets: Wallets
}): AnalyticsSeries[] {
  const { balances, flags, rowIds, toBaseAt, walletIds, wallets } = params
  const data = new Map(rowIds.map(id => [id, [] as number[]]))
  balances.forEach((point, index) => {
    const computed: Record<WalletId, WalletItemComputed> = {}
    for (const id of walletIds) {
      if (wallets[id])
        computed[id] = { ...wallets[id]!, amount: point[id] ?? 0 }
    }
    const counts = computeWalletCounts({
      includeArchivedInStats: flags.includeArchived,
      includeExcludedInStats: flags.includeExcluded,
      toBase: toBaseAt(index),
      totalWalletsCount: walletIds.length,
      walletIds,
      wallets: computed,
    })
    for (const count of Object.values(counts))
      data.get(count.id)?.push(count.value)
  })
  return rowIds.map((id, index) => ({ color: seriesPalette[index % seriesPalette.length], data: data.get(id)!, id }))
}
