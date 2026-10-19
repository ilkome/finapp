import { roundTo } from '~~/utils/amount/round'

import type { CategoryId } from '~/components/categories/types'
import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnId, TrnItem, Trns } from '~/components/trns/types'
import type { WalletId, WalletItem, Wallets } from '~/components/wallets/types'

import { currencyMinorUnit } from '~/components/currencies/currencies'
import { TrnType } from '~/components/trns/types'

/** Converts `amount` from `currency` into `base`. */
export function getAmountInRate(amount: number, currency: CurrencyCode, base: CurrencyCode, rates: Rates): number {
  if (base === currency)
    return amount
  return amount / (rates[currency] ?? 1) * (rates[base] ?? 1)
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
    return amount / from * to
  }
}

type TotalProps = {
  /** Currency `toBase` converts into; `net` and `sumTransfers` are rounded to its minor unit. */
  baseCurrency: CurrencyCode
  /** Category ids to drop from income/expense (dashboard "exclude from stats"). Balances never pass this. */
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  /** `undefined` means no rate: the amount is skipped and its currency listed in `missingRates`. */
  toBase: (amount: number, currency: CurrencyCode) => number | undefined
  /** Already filtered by wallet/category upstream (`filterTrnsIds`), so there is no wallet filter here. */
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, TrnItem>
  walletsItems: Record<WalletId, WalletItem>
}

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

export function getTotal({ baseCurrency, excludedCategoriesIds, toBase, trnsIds, trnsItems, walletsItems }: TotalProps): TotalReturns {
  const totals: Record<Bucket, number> = { adjustment: 0, expense: 0, expenseTransfers: 0, income: 0, incomeTransfers: 0 }
  const missingRates = new Set<CurrencyCode>()

  // An orphan trn (wallet deleted) is skipped everywhere, matching wallet balances.
  function add(bucket: Bucket, walletId: WalletId, amount: number) {
    const wallet = walletsItems[walletId]
    if (!wallet)
      return
    const converted = toBase(amount, wallet.currency)
    if (converted === undefined)
      missingRates.add(wallet.currency)
    else
      totals[bucket] += converted
  }

  for (const trnId of trnsIds) {
    const trn = trnsItems[trnId]
    if (!trn)
      continue

    if (trn.type === TrnType.Transfer) {
      if ('incomeWalletId' in trn && walletsItems[trn.incomeWalletId] && walletsItems[trn.expenseWalletId]) {
        add('incomeTransfers', trn.incomeWalletId, trn.incomeAmount)
        add('expenseTransfers', trn.expenseWalletId, trn.expenseAmount)
      }
      continue
    }

    const isIncome = trn.type === TrnType.Income
    if (trn.categoryId === 'adjustment')
      add('adjustment', trn.walletId, isIncome ? trn.amount : -trn.amount)
    // Single-leg transfer (bank import, counterparty account not in finapp): moves money
    // between accounts, so it belongs in the transfer buckets - never income/expense.
    else if (trn.categoryId === 'transfer')
      add(isIncome ? 'incomeTransfers' : 'expenseTransfers', trn.walletId, trn.amount)
    // Excluded-from-stats categories are kept in balances/lists but not counted here.
    else if (!excludedCategoriesIds?.has(trn.categoryId))
      add(isIncome ? 'income' : 'expense', trn.walletId, trn.amount)
  }

  // A difference of float sums that should be zero lands near it (100.10 + 200.70 - 300.80 =
  // -5.7e-14), and the formatter shows such a value digit by digit. `+ 0` turns `-0` into `0`.
  const precision = currencyMinorUnit(baseCurrency)
  return {
    ...totals,
    missingRates: [...missingRates],
    net: roundTo(totals.income - totals.expense, precision) + 0,
    sumTransfers: roundTo(totals.incomeTransfers - totals.expenseTransfers, precision) + 0,
  }
}

/**
 * Single-pass wallet balance computation. O(N) instead of O(W×N).
 * For each wallet, returns: income - expense + transfers + adjustments.
 */
export function getWalletsTotals(props: {
  trnsItems: Trns
  walletsItems: Wallets
}): Map<WalletId, number> {
  const { trnsItems, walletsItems } = props
  const totals = new Map<WalletId, number>()

  function addToWallet(walletId: WalletId, amount: number) {
    totals.set(walletId, (totals.get(walletId) ?? 0) + amount)
  }

  for (const trn of Object.values(trnsItems)) {
    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      if (!walletsItems[trn.walletId])
        continue
      addToWallet(trn.walletId, trn.type === TrnType.Income ? trn.amount : -trn.amount)
    }
    else if (trn.type === TrnType.Transfer && 'incomeWalletId' in trn) {
      if (!walletsItems[trn.incomeWalletId] || !walletsItems[trn.expenseWalletId])
        continue
      addToWallet(trn.incomeWalletId, trn.incomeAmount)
      addToWallet(trn.expenseWalletId, -trn.expenseAmount)
    }
  }

  // Summing kopecks as floats leaves noise (a repaid loan sums to 6.75e-11, not 0), and formatAmount
  // expands any non-zero value it would hide, so a closed credit showed a debt. Snap to the minor unit,
  // not the display precision: RUB displays 0 decimals while balances are kept to the kopeck.
  // `+ 0` turns the `-0` that rounding a tiny negative leaves into `0`.
  for (const [walletId, total] of totals)
    totals.set(walletId, roundTo(total, currencyMinorUnit(walletsItems[walletId]!.currency)) + 0)

  return totals
}
