import type { Categories } from '~/components/categories/types'
import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TransactionHistoryRow } from '~/components/trns/history/types'
import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { matchesTrnViewType } from '~/components/trns/tabClassification'
import { TrnType } from '~/components/trns/types'

export function buildTransactionHistoryRows({
  baseCurrency,
  categories,
  rates,
  trns,
  wallets,
}: {
  baseCurrency: CurrencyCode
  categories: Categories
  rates: Rates
  trns: Trns
  wallets: Wallets
}): { rows: TransactionHistoryRow[], unresolvedIds: string[] } {
  const rows: TransactionHistoryRow[] = []
  const unresolvedIds: string[] = []

  for (const [id, trn] of Object.entries(trns)) {
    const category = categories[trn.categoryId]
    if (!category) {
      unresolvedIds.push(id)
      continue
    }

    const parent = category.parentId ? categories[category.parentId] : undefined
    const type = matchesTrnViewType(trn, 'adjustment')
      ? 'adjustment'
      : matchesTrnViewType(trn, 'transfer')
        ? 'transfer'
        : trn.type === TrnType.Income ? 'income' : 'expense'

    if (trn.type === TrnType.Transfer) {
      const expenseWallet = wallets[trn.expenseWalletId]
      const incomeWallet = wallets[trn.incomeWalletId]
      if (!expenseWallet || !incomeWallet) {
        unresolvedIds.push(id)
        continue
      }

      rows.push({
        amountInBase: null,
        categoryColor: category.color,
        categoryIcon: category.icon,
        categoryId: trn.categoryId,
        categoryLabel: category.name,
        categoryPath: parent ? `${parent.name} / ${category.name}` : category.name,
        currencyCodes: [expenseWallet.currency, incomeWallet.currency],
        date: trn.date,
        description: trn.desc ?? '',
        id,
        trn,
        type,
        walletIds: [trn.expenseWalletId, trn.incomeWalletId],
        walletLabel: `${expenseWallet.name} / ${incomeWallet.name}`,
      })
      continue
    }

    const wallet = wallets[trn.walletId]
    if (!wallet) {
      unresolvedIds.push(id)
      continue
    }

    const convertedAmount = getAmountInRate({
      amount: trn.amount,
      baseCurrencyCode: baseCurrency,
      currencyCode: wallet.currency,
      rates,
    })

    rows.push({
      amountInBase: type === 'transfer' ? null : trn.type === TrnType.Income ? convertedAmount : -convertedAmount,
      categoryColor: category.color,
      categoryIcon: category.icon,
      categoryId: trn.categoryId,
      categoryLabel: category.name,
      categoryPath: parent ? `${parent.name} / ${category.name}` : category.name,
      currencyCodes: [wallet.currency],
      date: trn.date,
      description: trn.desc ?? '',
      id,
      trn,
      type,
      walletIds: [trn.walletId],
      walletLabel: wallet.name,
    })
  }

  return { rows, unresolvedIds }
}
