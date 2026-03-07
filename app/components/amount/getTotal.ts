import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'

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
