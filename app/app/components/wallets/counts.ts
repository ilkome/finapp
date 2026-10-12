import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemComputed, WalletType } from '~/components/wallets/types'

import { isCreditProduct, walletTypes } from '~/components/wallets/types'

type ToBase = (amount: number, currency: CurrencyCode) => number

type CountItem = {
  id: string
  isShow: boolean
  secondValue?: number
  value: number
}

export function computeWalletCounts(params: {
  includeArchivedInStats?: boolean
  includeExcludedInStats?: boolean
  toBase: ToBase
  totalWalletsCount: number
  walletIds: WalletId[]
  wallets: Record<WalletId, WalletItemComputed>
}): Record<string, CountItem> {
  const { includeArchivedInStats = false, includeExcludedInStats = false, toBase, totalWalletsCount, walletIds, wallets } = params

  const byType = Object.fromEntries(walletTypes.map(type => [type, 0])) as Record<WalletType, number>
  const sum = {
    archived: 0,
    creditPossible: 0,
    excludeInTotal: 0,
    total: 0,
    withdrawal: 0,
  }

  let hasArchivedWallet = false

  for (const walletId of walletIds) {
    const wallet = wallets[walletId]
    if (!wallet)
      continue

    const amount = toBase(wallet.amount ?? 0, wallet.currency)

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

    byType[wallet.type] += amount
    if (wallet.type === 'credit' && wallet.creditLimit)
      sum.creditPossible += toBase(wallet.creditLimit, wallet.currency)

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
      isShow: sum.withdrawal !== 0 && byType.credit !== 0,
      value: sum.withdrawal + byType.credit,
    },
    availableAll: {
      id: 'isAvailableAll',
      isShow: sum.withdrawal !== 0 && byType.loan !== 0,
      value: sum.withdrawal + byType.credit + byType.loan,
    },
    cash: {
      id: 'cash',
      isShow: totalWalletsCount > 1 && byType.cash !== 0,
      value: byType.cash,
    },
    cashless: {
      id: 'cashless',
      isShow: byType.cashless !== 0,
      value: byType.cashless,
    },
    credit: {
      id: 'credit',
      isShow: byType.credit !== 0,
      secondValue: sum.creditPossible,
      value: byType.credit,
    },
    crypto: {
      id: 'crypto',
      isShow: byType.crypto !== 0,
      value: byType.crypto,
    },
    debt: {
      id: 'debt',
      isShow: byType.debt !== 0,
      value: byType.debt,
    },
    deposit: {
      id: 'deposit',
      isShow: byType.deposit !== 0,
      value: byType.deposit,
    },
    excludeInTotal: {
      id: 'isExcludeInTotal',
      isShow: sum.excludeInTotal !== 0,
      value: sum.excludeInTotal,
    },
    loan: {
      id: 'loan',
      isShow: byType.loan !== 0,
      value: byType.loan,
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

export function sumWalletsInBase(walletIds: WalletId[], wallets: Record<WalletId, WalletItemComputed>, toBase: ToBase): number {
  let total = 0
  for (const id of walletIds) {
    const wallet = wallets[id]
    if (wallet)
      total += toBase(wallet.amount, wallet.currency)
  }
  return total
}

/** Sum in the wallets' own currency (a same-currency group), leaving out "not in total" wallets. */
export function sumWalletsInOwnCurrency(walletIds: WalletId[], wallets: Record<WalletId, WalletItemComputed>): number {
  let total = 0
  for (const id of walletIds) {
    const wallet = wallets[id]
    if (wallet && !wallet.isExcludeInTotal)
      total += wallet.amount
  }
  return total
}
