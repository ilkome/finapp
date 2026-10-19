import type { TrnId, TrnItem } from '~/components/trns/types'

// Amounts are minor units (USD and RUB: cents and kopecks); keys name them in whole units.
const base = { createdAt: 12, date: 86400000, updatedAt: 12 }

export const trnsItems: Record<TrnId, TrnItem> = {
  adjustmentExpenseWalletCashUSD30: { ...base, fromAmount: 3000, fromWalletId: 'walletCashUSD', type: 'adjustment' },
  adjustmentExpenseWalletCashUSD50: { ...base, fromAmount: 5000, fromWalletId: 'walletCashUSD', type: 'adjustment' },
  adjustmentIncomeWalletCashUSD30: { ...base, toAmount: 3000, toWalletId: 'walletCashUSD', type: 'adjustment' },
  adjustmentIncomeWalletCashUSD200: { ...base, toAmount: 20000, toWalletId: 'walletCashUSD', type: 'adjustment' },
  singleLegTransferExpenseWalletCashUSD50: { ...base, fromAmount: 5000, fromWalletId: 'walletCashUSD', type: 'transfer' },
  singleLegTransferIncomeWalletCashUSD60: { ...base, toAmount: 6000, toWalletId: 'walletCashUSD', type: 'transfer' },
  transactionExpenseWalletCashUSD400: { ...base, categoryId: 'expense', fromAmount: 40000, fromWalletId: 'walletCashUSD', type: 'expense' },
  transactionExpenseWalletOneRUB900: { ...base, categoryId: 'category1', fromAmount: 90000, fromWalletId: 'walletOneRUB', type: 'expense' },
  transactionIncomeWalletCashUSD1000: { ...base, categoryId: 'income', toAmount: 100000, toWalletId: 'walletCashUSD', type: 'income' },
  transactionIncomeWalletOneRUB700: { ...base, categoryId: 'category1', toAmount: 70000, toWalletId: 'walletOneRUB', type: 'income' },
  transferExpenseWalletCashUSD10IncomeWalletRUB700: { ...base, fromAmount: 1000, fromWalletId: 'walletCashUSD', toAmount: 70000, toWalletId: 'walletRUB', type: 'transfer' },
  transferExpenseWalletCreditUSD40IncomeWalletCashUSD40: { ...base, fromAmount: 4000, fromWalletId: 'walletCreditUSD', toAmount: 4000, toWalletId: 'walletCashUSD', type: 'transfer' },
  transferExpenseWalletRUB300IncomeWalletCreditUSD10: { ...base, fromAmount: 30000, fromWalletId: 'walletRUB', toAmount: 1000, toWalletId: 'walletCreditUSD', type: 'transfer' },
}
