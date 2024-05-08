import { TrnType } from '~/components/trns/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

export const trnsItems: Record<TrnId, TrnItem> = {
  transactionExpenseWalletCashUSD400: {
    amount: 400,
    categoryId: 'expense',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Expense,
    walletId: 'walletCashUSD',
  },

  transactionExpenseWalletOneRUB900: {
    amount: 900,
    categoryId: 'category1',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Expense,
    walletId: 'walletOneRUB',
  },

  transactionIncomeWalletCashUSD1000: {
    amount: 1000,
    categoryId: 'income',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Income,
    walletId: 'walletCashUSD',
  },

  transactionIncomeWalletOneRUB700: {
    amount: 700,
    categoryId: 'category1',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Income,
    walletId: 'walletOneRUB',
  },

  transferCategoryIdExpenseWalletCashUSD30: {
    amount: 30,
    categoryId: 'transfer',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Expense,
    walletId: 'walletCashUSD',
  },

  transferCategoryNameIncomeWalletCashUSD30: {
    amount: 30,
    categoryId: 'categoryTransferOld',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Income,
    walletId: 'walletCashUSD',
  },

  transferExpenseWalletCashUSD10IncomeWalletRUB700: {
    categoryId: 'transfer',
    date: 123456, // TODO: add real dates
    edited: 12,
    expenseAmount: 10,
    expenseWalletId: 'walletCashUSD',
    incomeAmount: 700,
    incomeWalletId: 'walletRUB',
    type: TrnType.Transfer,
  },

  transferExpenseWalletCreditUSD40IncomeWalletCashUSD40: {
    categoryId: 'transfer',
    date: 123456, // TODO: add real dates
    edited: 12,
    expenseAmount: 40,
    expenseWalletId: 'walletCreditUSD',
    incomeAmount: 40,
    incomeWalletId: 'walletCashUSD',
    type: TrnType.Transfer,
  },

  transferExpenseWalletRUB300IncomeWalletCreditUSD10: {
    categoryId: 'transfer',
    date: 123456, // TODO: add real dates
    edited: 12,
    expenseAmount: 300,
    expenseWalletId: 'walletRUB',
    incomeAmount: 10,
    incomeWalletId: 'walletCreditUSD',
    type: TrnType.Transfer,
  },

  // @deprecated: use New Transaction type instead or Transfer CategoryId
  transferOLDExpense2500Income3500: {
    amountFrom: 2500,
    amountTo: 3500,
    categoryId: 'transfer',
    date: 123456, // TODO: add real dates
    edited: 12,
    type: TrnType.Transfer,
    walletFromId: 'walletDeprecatedTransferExpense',
    walletToId: 'walletDeprecatedTransferIncome',
  },
}
