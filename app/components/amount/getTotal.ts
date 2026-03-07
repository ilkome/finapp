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
    return amount / (rates[currencyCode] || 1) * (rates[baseCurrencyCode] || 1)

  return amount
}

type TotalProps = {
  baseCurrencyCode?: string
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

    // Transaction
    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      // Adjustment: affects wallet balance but not income/expense statistics
      if (trn.categoryId === 'adjustment') {
        const wallet = walletsItems[trn.walletId]
        const amount = getAmount(trn.amount, wallet?.currency || 'USD')
        adjustment += trn.type === TrnType.Income ? amount : -amount
        continue
      }
      const wallet = walletsItems[trn.walletId]
      const sum = getAmount(trn.amount, wallet?.currency || 'USD')

      if (trn.type === TrnType.Income)
        income += sum
      else
        expense += sum
    }

    // Transfer
    else if (trn.type === TrnType.Transfer && 'incomeWalletId' in trn) {
      const incomeWallet = walletsItems[trn.incomeWalletId]
      const expenseWallet = walletsItems[trn.expenseWalletId]
      if (!incomeWallet || !expenseWallet)
        continue

      const incomeAmount = getAmount(trn.incomeAmount, incomeWallet.currency)
      const expenseAmount = getAmount(trn.expenseAmount, expenseWallet.currency)

      // Include only selected wallets
      if (walletsIds && walletsIds.length > 0) {
        // Income
        if (walletsIds.includes(trn.incomeWalletId))
          incomeTransfers += incomeAmount

        // Expense
        if (walletsIds.includes(trn.expenseWalletId))
          expenseTransfers += expenseAmount
      }
      else {
        incomeTransfers += incomeAmount
        expenseTransfers += expenseAmount
      }
    }
  }

  // Total
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

/**
 * Single-pass wallet balance computation. O(N) instead of O(W×N).
 * For each wallet, returns: income - expense + transfers + adjustments.
 */
export function getWalletsTotals(props: {
  baseCurrencyCode?: string
  rates?: Rates
  trnsItems: Trns
  walletsItems: Wallets
}): Map<WalletId, number> {
  const { baseCurrencyCode, rates, trnsItems, walletsItems } = props
  const totals = new Map<WalletId, number>()

  function addToWallet(walletId: WalletId, amount: number) {
    totals.set(walletId, (totals.get(walletId) ?? 0) + amount)
  }

  function convert(amount: number, currencyCode: CurrencyCode): number {
    return getAmountInRate({ amount, baseCurrencyCode, currencyCode, rates })
  }

  for (const trnId of Object.keys(trnsItems)) {
    const trn = trnsItems[trnId]
    if (!trn)
      continue

    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      const wallet = walletsItems[trn.walletId]
      if (!wallet)
        continue
      const amount = convert(trn.amount, wallet.currency)
      addToWallet(trn.walletId, trn.type === TrnType.Income ? amount : -amount)
    }
    else if (trn.type === TrnType.Transfer && 'incomeWalletId' in trn) {
      const incomeWallet = walletsItems[trn.incomeWalletId]
      const expenseWallet = walletsItems[trn.expenseWalletId]
      if (!incomeWallet || !expenseWallet)
        continue
      addToWallet(trn.incomeWalletId, convert(trn.incomeAmount, incomeWallet.currency))
      addToWallet(trn.expenseWalletId, -convert(trn.expenseAmount, expenseWallet.currency))
    }
  }

  return totals
}
