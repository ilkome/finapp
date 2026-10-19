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

    const amount = toBase(wallet.amount ?? 0, wallet.currencyCode)

    // "Archived" and "not in total" are independent slices: a wallet flagged both shows in both.
    if (wallet.isArchived) {
      sum.archived += amount
      hasArchivedWallet = true
    }

    if (wallet.isExcludedFromTotal)
      sum.excludeInTotal += amount

    // A flagged wallet stays out of every regular row until a matching switch is on, so the
    // per-type rows always add up to the total.
    if (!isCountedInTotals(wallet, { includeArchived: includeArchivedInStats, includeExcluded: includeExcludedInStats }))
      continue

    if (!isCreditProduct(wallet.type))
      sum.total += amount

    byType[wallet.type] += amount
    if (wallet.type === 'credit_card' && wallet.creditLimit)
      sum.creditPossible += toBase(wallet.creditLimit, wallet.currencyCode)

    // A debt is not money to withdraw: credit products join "available" through their own rows, not twice.
    if (wallet.isWithdrawable && !isCreditProduct(wallet.type))
      sum.withdrawal += amount
  }

  return {
    archived: {
      id: 'isArchived',
      isShow: hasArchivedWallet,
      value: Math.round(sum.archived),
    },
    // A big loan would keep one combined row always negative, so cards and loans get a row each.
    available: {
      id: 'isAvailable',
      isShow: sum.withdrawal !== 0 && byType.credit_card !== 0,
      value: Math.round(sum.withdrawal + byType.credit_card),
    },
    availableAll: {
      id: 'isAvailableAll',
      isShow: sum.withdrawal !== 0 && byType.loan !== 0,
      value: Math.round(sum.withdrawal + byType.credit_card + byType.loan),
    },
    bank_account: {
      id: 'bank_account',
      isShow: byType.bank_account !== 0,
      value: Math.round(byType.bank_account),
    },
    cash: {
      id: 'cash',
      isShow: totalWalletsCount > 1 && byType.cash !== 0,
      value: Math.round(byType.cash),
    },
    credit_card: {
      id: 'credit_card',
      isShow: byType.credit_card !== 0,
      secondValue: Math.round(sum.creditPossible),
      value: Math.round(byType.credit_card),
    },
    crypto: {
      id: 'crypto',
      isShow: byType.crypto !== 0,
      value: Math.round(byType.crypto),
    },
    debt: {
      id: 'debt',
      isShow: byType.debt !== 0,
      value: Math.round(byType.debt),
    },
    deposit: {
      id: 'deposit',
      isShow: byType.deposit !== 0,
      value: Math.round(byType.deposit),
    },
    excludeInTotal: {
      id: 'isExcludedFromTotal',
      isShow: sum.excludeInTotal !== 0,
      value: Math.round(sum.excludeInTotal),
    },
    loan: {
      id: 'loan',
      isShow: byType.loan !== 0,
      value: Math.round(byType.loan),
    },
    total: {
      id: 'total',
      isShow: true,
      value: Math.round(sum.total),
    },
    withdrawal: {
      id: 'isWithdrawable',
      isShow: sum.withdrawal !== 0,
      value: Math.round(sum.withdrawal),
    },
  }
}

type StatsFlags = { includeArchived?: boolean, includeExcluded?: boolean }

/** Whether a wallet counts toward totals: each switch adds the wallets carrying its flag, whatever their other flag. */
export function isCountedInTotals(wallet: WalletItemComputed, flags: StatsFlags = {}): boolean {
  if (!wallet.isArchived && !wallet.isExcludedFromTotal)
    return true
  return (wallet.isArchived && !!flags.includeArchived) || (wallet.isExcludedFromTotal && !!flags.includeExcluded)
}

/** Sum in base currency of the wallets that count toward totals. */
export function sumWalletsInBase(walletIds: WalletId[], wallets: Record<WalletId, WalletItemComputed>, toBase: ToBase, flags?: StatsFlags): number {
  let total = 0
  for (const id of walletIds) {
    const wallet = wallets[id]
    if (wallet && isCountedInTotals(wallet, flags))
      total += toBase(wallet.amount, wallet.currencyCode)
  }
  return Math.round(total)
}

/** Sum in the wallets' own currency (a same-currency group) of the wallets that count toward totals. */
export function sumWalletsInOwnCurrency(walletIds: WalletId[], wallets: Record<WalletId, WalletItemComputed>, flags?: StatsFlags): number {
  let total = 0
  for (const id of walletIds) {
    const wallet = wallets[id]
    if (wallet && isCountedInTotals(wallet, flags))
      total += wallet.amount
  }
  return total
}
