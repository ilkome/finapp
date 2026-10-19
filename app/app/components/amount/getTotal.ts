import { convert } from '~~/utils/money/convert'

import type { CategoryId } from '~/components/categories/types'
import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnId, TrnItem, Trns } from '~/components/trns/types'
import type { WalletId, WalletItem, Wallets } from '~/components/wallets/types'

import { scaleOf } from '~/components/amount/utils'

/**
 * Converts minor units of `currency` into minor units of `base`, unrounded: a sum of conversions is rounded once,
 * at the end. `rates` are units of each currency per one unit of the rates' base.
 */
export function getAmountInRate(amount: number, currency: CurrencyCode, base: CurrencyCode, rates: Rates): number {
  if (base === currency)
    return amount
  return amount / (rates[currency] ?? 1) * (rates[base] ?? 1) * 10 ** (scaleOf(base) - scaleOf(currency))
}

export class MissingRateError extends Error {
  constructor(readonly currency: CurrencyCode) {
    super(`Missing rate for ${currency}`)
    this.name = 'MissingRateError'
  }
}

/**
 * Converter that refuses to guess: once rates are loaded, a currency (or base) without a rate
 * throws in dev and returns `undefined` in prod, so the amount is left out of a total instead of
 * counted at 1:1. Before rates load (empty object) it converts at face value and never reports.
 */
export function createToBase(
  getBase: () => CurrencyCode,
  getRates: () => Rates,
  { isDev, onMissing }: { isDev: boolean, onMissing: (currency: CurrencyCode) => void },
) {
  return (amount: number, currency: CurrencyCode): number | undefined => {
    const base = getBase()
    if (currency === base)
      return amount
    const rates = getRates()
    const from = rates[currency]
    const to = rates[base]
    if (from === undefined || to === undefined) {
      if (Object.keys(rates).length === 0)
        return amount
      const missing = from === undefined ? currency : base
      if (isDev)
        throw new MissingRateError(missing)
      onMissing(missing)
      return undefined
    }
    return convert(amount, currency, base, rates, scaleOf)
  }
}

type TotalProps = {
  /** Category ids to drop from income/expense (dashboard "exclude from stats"). Balances never pass this. */
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  /** Minor units of a currency to unrounded base minor units; `undefined` means no rate: the amount is skipped and its currency listed in `missingRates`. */
  toBase: (amount: number, currency: CurrencyCode) => number | undefined
  /** Already filtered by wallet/category upstream (`filterTrnsIds`), so there is no wallet filter here. */
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, TrnItem>
  walletsItems: Record<WalletId, WalletItem>
}

/** Base-currency minor units, each rounded once. */
export type TotalReturns = {
  adjustment: number
  expense: number
  expenseTransfers: number
  income: number
  incomeTransfers: number
  /** Currencies left out for lack of a rate; non-empty means the total is incomplete. */
  missingRates: CurrencyCode[]
  net: number
  sumTransfers: number
}

type Bucket = 'adjustment' | 'expense' | 'expenseTransfers' | 'income' | 'incomeTransfers'

export function getTotal({ excludedCategoriesIds, toBase, trnsIds, trnsItems, walletsItems }: TotalProps): TotalReturns {
  const totals: Record<Bucket, number> = { adjustment: 0, expense: 0, expenseTransfers: 0, income: 0, incomeTransfers: 0 }
  const missingRates = new Set<CurrencyCode>()

  // A side whose wallet is gone (orphan) is skipped everywhere, matching wallet balances.
  function add(bucket: Bucket, walletId: WalletId | undefined, amount: number | undefined) {
    const wallet = walletId ? walletsItems[walletId] : undefined
    if (!wallet || amount === undefined)
      return
    const converted = toBase(amount, wallet.currencyCode)
    if (converted === undefined)
      missingRates.add(wallet.currencyCode)
    else
      totals[bucket] += converted
  }

  for (const trnId of trnsIds) {
    const trn = trnsItems[trnId]
    if (!trn)
      continue

    switch (trn.type) {
      case 'transfer':
        add('incomeTransfers', trn.toWalletId, trn.toAmount)
        add('expenseTransfers', trn.fromWalletId, trn.fromAmount)
        break
      case 'adjustment':
        add('adjustment', trn.toWalletId, trn.toAmount)
        add('adjustment', trn.fromWalletId, trn.fromAmount === undefined ? undefined : -trn.fromAmount)
        break
      // Excluded-from-stats categories are kept in balances/lists but not counted here.
      case 'expense':
        if (!excludedCategoriesIds?.has(trn.categoryId!))
          add('expense', trn.fromWalletId, trn.fromAmount)
        break
      case 'income':
        if (!excludedCategoriesIds?.has(trn.categoryId!))
          add('income', trn.toWalletId, trn.toAmount)
        break
    }
  }

  // `+ 0` turns the `-0` that rounding a tiny negative leaves into `0`.
  const round = (value: number) => Math.round(value) + 0
  return {
    adjustment: round(totals.adjustment),
    expense: round(totals.expense),
    expenseTransfers: round(totals.expenseTransfers),
    income: round(totals.income),
    incomeTransfers: round(totals.incomeTransfers),
    missingRates: [...missingRates],
    net: round(totals.income - totals.expense),
    sumTransfers: round(totals.incomeTransfers - totals.expenseTransfers),
  }
}

/** Every wallet's balance in its minor units: what flows in minus what flows out, one rule for every type. */
export function getWalletsTotals(props: {
  trnsItems: Trns
  walletsItems: Wallets
}): Map<WalletId, number> {
  const { trnsItems, walletsItems } = props
  const totals = new Map<WalletId, number>()

  for (const trn of Object.values(trnsItems)) {
    if (trn.toWalletId && walletsItems[trn.toWalletId])
      totals.set(trn.toWalletId, (totals.get(trn.toWalletId) ?? 0) + trn.toAmount!)
    if (trn.fromWalletId && walletsItems[trn.fromWalletId])
      totals.set(trn.fromWalletId, (totals.get(trn.fromWalletId) ?? 0) - trn.fromAmount!)
  }

  return totals
}
