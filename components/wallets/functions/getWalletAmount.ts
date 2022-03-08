import type { TrnID, TrnItem } from '~/components/trns/types'
import { TrnType } from '~/components/trns/types'
import type { WalletID } from '~/components/wallets/types'

interface Types {
  walletId: WalletID
  trnsIds: TrnID[]
  trnsItems: Record<TrnID, TrnItem>
}

export function getWalletAmount({ walletId, trnsIds, trnsItems }: Types): {
  income: number
  expense: number
  total: number
} {
  let sum = 0
  let income = 0
  let expense = 0

  for (const trnId of trnsIds) {
    const trn = trnsItems[trnId]

    // Income
    if (trn.type === TrnType.Income) {
      sum = sum + trn.amount
      income = income + trn.amount
    }

    // Expense
    if (trn.type === TrnType.Expense) {
      sum = sum - trn.amount
      expense = expense + trn.amount
    }

    // Transfer
    if (trn.type === TrnType.Transfer) {
      if (!trn.incomeAmount || !trn.expenseAmount) {
        return {
          total: sum,
          income,
          expense,
        }
      }

      if (trn.incomeWalletId === walletId) {
        sum = sum + trn.incomeAmount
        income = income + trn.incomeAmount
      }

      if (trn.expenseWalletId === walletId) {
        sum = sum - trn.expenseAmount
        expense = expense + trn.expenseAmount
      }
    }
  }

  return {
    total: income - expense,
    income,
    expense,
  }
}
