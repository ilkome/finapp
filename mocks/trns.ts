import type { TrnId, TrnItem } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

export const trnsItems: Record<TrnId, TrnItem> = {
  transactionExpenseWalletCashUSD400: {
    amount: 400,
    categoryId: 'expense',
    date: 123456,
    type: TrnType.Expense,
    updatedAt: 12,
    walletId: 'walletCashUSD',
  },

  transactionExpenseWalletOneRUB900: {
    amount: 900,
    categoryId: 'category1',
    date: 123456,
    type: TrnType.Expense,
    updatedAt: 12,
    walletId: 'walletOneRUB',
  },

  transactionIncomeWalletCashUSD1000: {
    amount: 1000,
    categoryId: 'income',
    date: 123456,
    type: TrnType.Income,
    updatedAt: 12,
    walletId: 'walletCashUSD',
  },

  transactionIncomeWalletOneRUB700: {
    amount: 700,
    categoryId: 'category1',
    date: 123456,
    type: TrnType.Income,
    updatedAt: 12,
    walletId: 'walletOneRUB',
  },

  transferCategoryIdExpenseWalletCashUSD30: {
    amount: 30,
    categoryId: 'transfer',
    date: 123456,
    type: TrnType.Expense,
    updatedAt: 12,
    walletId: 'walletCashUSD',
  },

  transferCategoryIncomeWalletCashUSD30: {
    amount: 30,
    categoryId: 'transfer',
    date: 123456,
    type: TrnType.Income,
    updatedAt: 12,
    walletId: 'walletCashUSD',
  },

  transferExpenseWalletCashUSD10IncomeWalletRUB700: {
    categoryId: 'transfer',
    date: 123456,
    expenseAmount: 10,
    expenseWalletId: 'walletCashUSD',
    incomeAmount: 700,
    incomeWalletId: 'walletRUB',
    type: TrnType.Transfer,
    updatedAt: 12,
  },

  transferExpenseWalletCreditUSD40IncomeWalletCashUSD40: {
    categoryId: 'transfer',
    date: 123456,
    expenseAmount: 40,
    expenseWalletId: 'walletCreditUSD',
    incomeAmount: 40,
    incomeWalletId: 'walletCashUSD',
    type: TrnType.Transfer,
    updatedAt: 12,
  },

  transferExpenseWalletRUB300IncomeWalletCreditUSD10: {
    categoryId: 'transfer',
    date: 123456,
    expenseAmount: 300,
    expenseWalletId: 'walletRUB',
    incomeAmount: 10,
    incomeWalletId: 'walletCreditUSD',
    type: TrnType.Transfer,
    updatedAt: 12,
  },

}
