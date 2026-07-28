import type { CategoryId } from '~/components/categories/types'
import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnId, TrnItem, Trns } from '~/components/trns/types'
import type { WalletId, WalletItem, Wallets } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'

export function getAmountInRate({
  amount,
  baseCurrencyCode,
  currencyCode,
  rates,
}: {
  amount: number
  baseCurrencyCode?: CurrencyCode
  currencyCode: CurrencyCode
  rates?: Rates
}): number {
  if (!baseCurrencyCode || !rates)
    return amount

  if (baseCurrencyCode !== currencyCode)
    return amount / (rates[currencyCode] ?? 1) * (rates[baseCurrencyCode] ?? 1)

  return amount
}

type TotalProps = {
  baseCurrencyCode?: CurrencyCode
  /** Category ids to drop from income/expense (dashboard "exclude from stats"). Balances never pass this. */
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  rates?: Rates
  trnsIds?: TrnId[]
  trnsItems: Record<TrnId, TrnItem>
  walletsIds?: WalletId[]
  walletsItems: Record<WalletId, WalletItem>
}

export type TotalReturns = {
  adjustment: number
  expense: number
  expenseTransfers: number
  income: number
  incomeTransfers: number
  sum: number
  sumTransfers: number
}

export function getTotal(props: TotalProps): TotalReturns {
  const { baseCurrencyCode, rates, trnsIds, trnsItems, walletsIds, walletsItems } = props
  const walletsSet = walletsIds?.length ? new Set(walletsIds) : null

  function getAmount(amount: number, currencyCode: CurrencyCode) {
    return getAmountInRate({
      amount,
      baseCurrencyCode,
      currencyCode,
      rates,
    })
  }

  let income = 0
  let expense = 0
  let incomeTransfers = 0
  let expenseTransfers = 0
  let adjustment = 0

  for (const trnId of trnsIds || []) {
    const trn = trnsItems[trnId]
    if (!trn)
      continue

    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      if (trn.categoryId === 'adjustment') {
        const wallet = walletsItems[trn.walletId]
        const amount = getAmount(trn.amount, wallet?.currency ?? 'USD')
        adjustment += trn.type === TrnType.Income ? amount : -amount
        continue
      }
      // Single-leg transfer (bank import, counterparty account not in finapp): moves money
      // between accounts, so it belongs in the transfer buckets - never income/expense.
      if (trn.categoryId === 'transfer') {
        if (!walletsSet || walletsSet.has(trn.walletId)) {
          const wallet = walletsItems[trn.walletId]
          const sum = getAmount(trn.amount, wallet?.currency ?? 'USD')
          if (trn.type === TrnType.Income)
            incomeTransfers += sum
          else
            expenseTransfers += sum
        }
        continue
      }
      // Excluded-from-stats categories are kept in balances/lists but not counted here.
      if (props.excludedCategoriesIds?.has(trn.categoryId))
        continue
      const wallet = walletsItems[trn.walletId]
      const sum = getAmount(trn.amount, wallet?.currency ?? 'USD')

      if (trn.type === TrnType.Income)
        income += sum
      else
        expense += sum
    }

    else if (trn.type === TrnType.Transfer && 'incomeWalletId' in trn) {
      const incomeWallet = walletsItems[trn.incomeWalletId]
      const expenseWallet = walletsItems[trn.expenseWalletId]
      if (!incomeWallet || !expenseWallet)
        continue

      const incomeAmount = getAmount(trn.incomeAmount, incomeWallet.currency)
      const expenseAmount = getAmount(trn.expenseAmount, expenseWallet.currency)

      if (walletsSet) {
        if (walletsSet.has(trn.incomeWalletId))
          incomeTransfers += incomeAmount

        if (walletsSet.has(trn.expenseWalletId))
          expenseTransfers += expenseAmount
      }
      else {
        incomeTransfers += incomeAmount
        expenseTransfers += expenseAmount
      }
    }
  }

  const sum = income - expense
  const sumTransfers = incomeTransfers - expenseTransfers

  return {
    adjustment,
    expense,
    expenseTransfers,
    income,
    incomeTransfers,
    sum,
    sumTransfers,
  }
}

/** Merges two totals field by field - used to combine actuals with a forecast total. */
export function addTotals(a: TotalReturns, b: TotalReturns): TotalReturns {
  return {
    adjustment: a.adjustment + b.adjustment,
    expense: a.expense + b.expense,
    expenseTransfers: a.expenseTransfers + b.expenseTransfers,
    income: a.income + b.income,
    incomeTransfers: a.incomeTransfers + b.incomeTransfers,
    sum: a.sum + b.sum,
    sumTransfers: a.sumTransfers + b.sumTransfers,
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

  for (const trnId of Object.keys(trnsItems)) {
    const trn = trnsItems[trnId]
    if (!trn)
      continue

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

  return totals
}
