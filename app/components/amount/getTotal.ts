import type { CategoryId } from '~/components/categories/types'
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
  baseCurrencyCode?: string // TODO: add typings
  currencyCode: string
  rates?: Record<string, number> // TODO: add typings
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
  transferCategoriesIds?: CategoryId[]
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, TrnItem>
  walletsIds?: WalletId[]
  walletsItems: Record<WalletId, WalletItem>
}

export type DateString = string

export type TotalReturns = {
  expense: number
  expenseTransfers: number
  income: number
  incomeTransfers: number
  sum: number
  sumTransfers: number
}

export function getTotal(props: TotalProps): TotalReturns {
  const { baseCurrencyCode, rates, transferCategoriesIds, trnsIds, trnsItems, walletsIds, walletsItems } = props

  function getAmount(amount: number, currencyCode: string) {
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

  for (const trnId of trnsIds || []) {
    const trn = trnsItems[trnId]
    if (!trn)
      continue

    // Transaction
    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      const isTransferCategory = transferCategoriesIds?.includes(trn.categoryId || '')
      const wallet = walletsItems[trn.walletId]
      const sum = getAmount(trn.amount, wallet?.currency || 'USD')

      // Income
      if (trn.type === TrnType.Income) {
        if (isTransferCategory)
          incomeTransfers += sum
        else
          income += sum
      }

      // Expense
      if (trn.type === TrnType.Expense) {
        if (isTransferCategory)
          expenseTransfers += sum
        else
          expense += sum
      }
    }

    // Transfer v2
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

    // Transfer @deprecated
    else if (trn.type === TrnType.Transfer && 'walletFromId' in trn && 'walletToId' in trn) {
      const incomeWalletId = trn.walletToId as WalletId
      const expenseWalletId = trn.walletFromId as WalletId
      if (!incomeWalletId || !expenseWalletId)
        continue

      const incomeWallet = walletsItems[incomeWalletId]
      const expenseWallet = walletsItems[expenseWalletId]
      if (!incomeWallet || !expenseWallet)
        continue

      const incomeAmount = getAmount(trn.amountTo as number, incomeWallet.currency)
      const expenseAmount = getAmount(trn.amountFrom as number, expenseWallet.currency)

      // Include only selected wallets
      if (walletsIds && walletsIds.length > 0) {
        // Income
        if (walletsIds.includes(incomeWalletId))
          incomeTransfers += incomeAmount

        // Expense
        if (walletsIds.includes(expenseWalletId))
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
    expense,
    expenseTransfers,
    income,
    incomeTransfers,
    sum,
    sumTransfers,
  }
}
