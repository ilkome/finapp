import type { CategoryID } from '~/components/categories/types'
import type { TrnID, TrnItem } from '~/components/trns/types'
import type { WalletID, WalletItem } from '~/components/wallets/types'
import { TrnType } from '~/components/trns/types'

export function getAmountInRate({
  amount,
  currencyCode,
  baseCurrencyCode,
  rates,
}: {
  amount: number
  currencyCode: string
  baseCurrencyCode: string // TODO: add typings
  rates: Record<string, number> // TODO: add typings
}): number {
  if (!baseCurrencyCode || !rates)
    return amount

  if (baseCurrencyCode !== currencyCode)
    return amount / rates[currencyCode] * rates[baseCurrencyCode]

  return amount
}

interface TotalProps {
  trnsIds: TrnID[]
  trnsItems: Record<TrnID, TrnItem>
  walletsItems: Record<WalletID, WalletItem>
  transferCategoriesIds?: CategoryID[]
  walletsIds?: WalletID[]
  baseCurrencyCode?: string // TODO: add typings
  rates?: Record<string, number> // TODO: add typings
}

export interface TotalReturns {
  incomeTransactions: number
  expenseTransactions: number
  sumTransactions: number
  incomeTransfers: number
  expenseTransfers: number
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

  let incomeTransactions = 0
  let expenseTransactions = 0
  let incomeTransfers = 0
  let expenseTransfers = 0

  for (const trnId of trnsIds) {
    const trn = trnsItems[trnId]

    // Transaction
    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      const isTransferCategory = transferCategoriesIds?.includes(trn.categoryId)
      const wallet = walletsItems[trn.walletId]
      const sum = getAmount(trn.amount, wallet.currency)

      // Income
      if (trn.type === TrnType.Income) {
        isTransferCategory
          ? incomeTransfers += sum
          : incomeTransactions += sum
      }

      // Expense
      if (trn.type === TrnType.Expense) {
        isTransferCategory
          ? expenseTransfers += sum
          : expenseTransactions += sum
      }
    }

    // Transfer v2
    else if (trn.type === TrnType.Transfer && 'incomeWalletId' in trn) {
      const incomeWallet = walletsItems[trn.incomeWalletId]
      const expenseWallet = walletsItems[trn.expenseWalletId]
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

      // Include all wallets
      else {
        incomeTransfers += incomeAmount
        expenseTransfers += expenseAmount
      }
    }

    // Transfer @deprecated
    else if (trn.type === TrnType.Transfer && 'walletFromId' in trn) {
      const incomeWallet = walletsItems[trn.walletToId]
      const expenseWallet = walletsItems[trn.walletFromId]
      const incomeAmount = getAmount(trn.amountTo, incomeWallet.currency)
      const expenseAmount = getAmount(trn.amountFrom, expenseWallet.currency)

      // Include only selected wallets
      if (walletsIds && walletsIds.length > 0) {
        // Income
        if (walletsIds.includes(trn.walletToId))
          incomeTransfers += incomeAmount

        // Expense
        if (walletsIds.includes(trn.walletFromId))
          expenseTransfers += expenseAmount
      }

      // Include all wallets
      else {
        incomeTransfers += incomeAmount
        expenseTransfers += expenseAmount
      }
    }
  }

  // Total
  const sumTransactions = incomeTransactions - expenseTransactions
  const sumTransfers = incomeTransfers - expenseTransfers

  return {
    incomeTransactions,
    expenseTransactions,
    sumTransactions,

    incomeTransfers,
    expenseTransfers,
    sumTransfers,
  }
}
