import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { isCreditProduct } from '~/components/wallets/types'

type CountItem = {
  id: string
  isShow: boolean
  secondValue?: number
  value: number
}

export function computeWalletCounts(params: {
  baseCurrency?: CurrencyCode
  includeArchivedInStats?: boolean
  includeExcludedInStats?: boolean
  rates?: Rates
  totalWalletsCount: number
  walletIds: WalletId[]
  wallets: Record<WalletId, WalletItemComputed>
}): Record<string, CountItem> {
  const { baseCurrency, includeArchivedInStats = false, includeExcludedInStats = false, rates, totalWalletsCount, walletIds, wallets } = params

  function convert(amount: number, currencyCode: CurrencyCode): number {
    return getAmountInRate({ amount, baseCurrencyCode: baseCurrency, currencyCode, rates })
  }

  const sum = {
    archived: 0,
    cash: 0,
    cashless: 0,
    credit: 0,
    creditPossible: 0,
    crypto: 0,
    debt: 0,
    deposit: 0,
    excludeInTotal: 0,
    loan: 0,
    total: 0,
    withdrawal: 0,
  }

  let hasArchivedWallet = false

  for (const walletId of walletIds) {
    const wallet = wallets[walletId]
    if (!wallet)
      continue

    const amount = convert(wallet.amount ?? 0, wallet.currency ?? 'USD')

    // "Archived" and "not in total" are independent slices: a wallet flagged both shows in both.
    if (wallet.isArchived) {
      sum.archived += amount
      hasArchivedWallet = true
    }

    if (wallet.isExcludeInTotal)
      sum.excludeInTotal += amount

    // Either flag opts the wallet out of every regular row until its own switch is on, so the
    // per-type rows always add up to the total.
    if (wallet.isArchived && !includeArchivedInStats)
      continue
    if (wallet.isExcludeInTotal && !includeExcludedInStats)
      continue

    if (!isCreditProduct(wallet.type))
      sum.total += amount

    switch (wallet.type) {
      case 'cash':
        sum.cash += amount
        break
      case 'cashless':
        sum.cashless += amount
        break
      case 'credit':
        sum.credit += amount
        if (wallet.creditLimit)
          sum.creditPossible += convert(wallet.creditLimit, wallet.currency ?? 'USD')
        break
      case 'loan':
        sum.loan += amount
        break
      case 'crypto':
        sum.crypto += amount
        break
      case 'debt':
        sum.debt += amount
        break
      case 'deposit':
        sum.deposit += amount
        break
    }

    // A debt is not money to withdraw: credit products join "available" through their own rows, not twice.
    if (wallet.isWithdrawal && !isCreditProduct(wallet.type))
      sum.withdrawal += amount
  }

  return {
    archived: {
      id: 'isArchived',
      isShow: hasArchivedWallet,
      value: sum.archived,
    },
    // A big loan would keep one combined row always negative, so cards and loans get a row each.
    available: {
      id: 'isAvailable',
      isShow: sum.withdrawal !== 0 && sum.credit !== 0,
      value: sum.withdrawal + sum.credit,
    },
    availableAll: {
      id: 'isAvailableAll',
      isShow: sum.withdrawal !== 0 && sum.loan !== 0,
      value: sum.withdrawal + sum.credit + sum.loan,
    },
    cash: {
      id: 'cash',
      isShow: totalWalletsCount > 1 && sum.cash !== 0,
      value: sum.cash,
    },
    cashless: {
      id: 'cashless',
      isShow: sum.cashless !== 0,
      value: sum.cashless,
    },
    credit: {
      id: 'credit',
      isShow: sum.credit !== 0,
      secondValue: sum.creditPossible,
      value: sum.credit,
    },
    crypto: {
      id: 'crypto',
      isShow: sum.crypto !== 0,
      value: sum.crypto,
    },
    debt: {
      id: 'debt',
      isShow: sum.debt !== 0,
      value: sum.debt,
    },
    deposit: {
      id: 'deposit',
      isShow: sum.deposit !== 0,
      value: sum.deposit,
    },
    excludeInTotal: {
      id: 'isExcludeInTotal',
      isShow: sum.excludeInTotal !== 0,
      value: sum.excludeInTotal,
    },
    loan: {
      id: 'loan',
      isShow: sum.loan !== 0,
      value: sum.loan,
    },
    total: {
      id: 'total',
      isShow: true,
      value: sum.total,
    },
    withdrawal: {
      id: 'isWithdrawal',
      isShow: sum.withdrawal !== 0,
      value: sum.withdrawal,
    },
  }
}

export function sumWalletAmounts(params: {
  baseCurrency?: CurrencyCode
  convert?: boolean
  rates?: Rates
  walletIds: WalletId[]
  wallets: Record<WalletId, WalletItemComputed>
}): number {
  const { baseCurrency, convert = true, rates, walletIds, wallets } = params

  let total = 0
  for (const id of walletIds) {
    const wallet = wallets[id]
    if (!wallet)
      continue

    if (convert) {
      total += getAmountInRate({
        amount: wallet.amount,
        baseCurrencyCode: baseCurrency,
        currencyCode: wallet.currency,
        rates,
      })
    }
    else {
      if (!wallet.isExcludeInTotal)
        total += wallet.amount
    }
  }

  return total
}
