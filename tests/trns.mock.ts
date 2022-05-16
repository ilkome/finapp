import { TrnType } from '~/components/trns/types'
import type { TrnTransaction, TrnTransfer, TrnTransferOld } from '~/components/trns/types'

export const trnsItems = {
  transactionIncomeWalletCashUSD1000: {
    amount: 1000,
    categoryId: 'income',
    type: TrnType.Income,
    walletId: 'walletCashUSD',
  } as TrnTransaction,

  transactionExpenseWalletCashUSD400: {
    amount: 400,
    categoryId: 'expense',
    type: TrnType.Expense,
    walletId: 'walletCashUSD',
  } as TrnTransaction,

  transactionIncomeWalletOneRUB700: {
    amount: 700,
    categoryId: 'category1',
    type: TrnType.Income,
    walletId: 'walletOneRUB',
  } as TrnTransaction,

  transactionExpenseWalletOneRUB900: {
    amount: 900,
    categoryId: 'category1',
    type: TrnType.Expense,
    walletId: 'walletOneRUB',
  } as TrnTransaction,

  transferExpenseWalletCreditUSD40IncomeWalletCashUSD40: {
    categoryId: 'transfer',
    incomeAmount: 40,
    incomeWalletId: 'walletCashUSD',
    expenseAmount: 40,
    expenseWalletId: 'walletCreditUSD',
    type: TrnType.Transfer,
  } as TrnTransfer,

  transferExpenseWalletRUB300IncomeWalletCreditUSD10: {
    categoryId: 'transfer',
    incomeAmount: 10,
    incomeWalletId: 'walletCreditUSD',
    expenseAmount: 300,
    expenseWalletId: 'walletRUB',
    type: TrnType.Transfer,
  } as TrnTransfer,

  transferExpenseWalletCashUSD10IncomeWalletRUB700: {
    categoryId: 'transfer',
    incomeAmount: 700,
    incomeWalletId: 'walletRUB',
    expenseAmount: 10,
    expenseWalletId: 'walletCashUSD',
    type: TrnType.Transfer,
  } as TrnTransfer,

  transferCategoryNameIncomeWalletCashUSD30: {
    amount: 30,
    categoryId: 'categoryTranferOld',
    type: TrnType.Income,
    walletId: 'walletCashUSD',
  } as TrnTransaction,

  transferCategoryIdExpenseWalletCashUSD30: {
    amount: 30,
    categoryId: 'transfer',
    type: TrnType.Expense,
    walletId: 'walletCashUSD',
  } as TrnTransaction,

  // @deprecated: use New Transaction type instead or Transfer CategoryId
  transferOLDExpense2500Income3500: {
    categoryId: 'transfer',
    type: TrnType.Transfer,
    amountFrom: 2500,
    walletFromId: 'walletDeprecatedTransferExpense',
    amountTo: 3500,
    walletToId: 'walletDeprecatedTransferIncome',
  } as TrnTransferOld,
}
