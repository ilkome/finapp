import { TrnType } from '~/components/trns/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

export const trnsItems: Record<TrnId, TrnItem> = {
  transactionIncomeWalletCashUSD1000: {
    amount: 1000,
    date: 123456, // TODO: add real dates
    categoryId: 'income',
    type: TrnType.Income,
    walletId: 'walletCashUSD',
  },

  transactionExpenseWalletCashUSD400: {
    amount: 400,
    date: 123456, // TODO: add real dates
    categoryId: 'expense',
    type: TrnType.Expense,
    walletId: 'walletCashUSD',
  },

  transactionIncomeWalletOneRUB700: {
    amount: 700,
    date: 123456, // TODO: add real dates
    categoryId: 'category1',
    type: TrnType.Income,
    walletId: 'walletOneRUB',
  },

  transactionExpenseWalletOneRUB900: {
    amount: 900,
    date: 123456, // TODO: add real dates
    categoryId: 'category1',
    type: TrnType.Expense,
    walletId: 'walletOneRUB',
  },

  transferExpenseWalletCreditUSD40IncomeWalletCashUSD40: {
    date: 123456, // TODO: add real dates
    categoryId: 'transfer',
    incomeAmount: 40,
    incomeWalletId: 'walletCashUSD',
    expenseAmount: 40,
    expenseWalletId: 'walletCreditUSD',
    type: TrnType.Transfer,
  },

  transferExpenseWalletRUB300IncomeWalletCreditUSD10: {
    date: 123456, // TODO: add real dates
    categoryId: 'transfer',
    incomeAmount: 10,
    incomeWalletId: 'walletCreditUSD',
    expenseAmount: 300,
    expenseWalletId: 'walletRUB',
    type: TrnType.Transfer,
  },

  transferExpenseWalletCashUSD10IncomeWalletRUB700: {
    date: 123456, // TODO: add real dates
    categoryId: 'transfer',
    incomeAmount: 700,
    incomeWalletId: 'walletRUB',
    expenseAmount: 10,
    expenseWalletId: 'walletCashUSD',
    type: TrnType.Transfer,
  },

  transferCategoryNameIncomeWalletCashUSD30: {
    date: 123456, // TODO: add real dates
    amount: 30,
    categoryId: 'categoryTransferOld',
    type: TrnType.Income,
    walletId: 'walletCashUSD',
  },

  transferCategoryIdExpenseWalletCashUSD30: {
    date: 123456, // TODO: add real dates
    amount: 30,
    categoryId: 'transfer',
    type: TrnType.Expense,
    walletId: 'walletCashUSD',
  },

  // @deprecated: use New Transaction type instead or Transfer CategoryId
  transferOLDExpense2500Income3500: {
    date: 123456, // TODO: add real dates
    categoryId: 'transfer',
    type: TrnType.Transfer,
    amountFrom: 2500,
    walletFromId: 'walletDeprecatedTransferExpense',
    amountTo: 3500,
    walletToId: 'walletDeprecatedTransferIncome',
  },
}
