import type { ToBase } from '~/components/wallets/analytics/balanceHistory'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { seriesPalette } from '~/components/wallets/analytics/balanceHistory'

export type SharesGroupBy = 'currency' | 'type' | 'wallet'
/** `all` compares every balance by its absolute value, debts included. */
export type SharesMode = 'all' | 'assets' | 'debts'
export type SharesSort = 'amount' | 'name'

export type ShareItem = {
  color: string
  id: string
  share: number
  /** Signed sum in base currency, debts negative. */
  signedValue: number
  /** Positive magnitude the share is measured by. */
  value: number
  walletIds: WalletId[]
}

/** Current balances grouped and measured for the shares chart, largest first. */
export function computeShares(params: {
  groupBy: SharesGroupBy
  mode: SharesMode
  toBase: ToBase
  walletIds: WalletId[]
  wallets: Record<WalletId, WalletItemComputed>
}): { items: ShareItem[], total: number } {
  const { groupBy, mode, toBase, walletIds, wallets } = params
  const groups = new Map<string, { signedValue: number, walletIds: WalletId[] }>()

  for (const id of walletIds) {
    const wallet = wallets[id]
    if (!wallet)
      continue
    const amount = toBase(wallet.amount, wallet.currency)
    // A balance is an asset or a debt by its sign, so an overdrawn debit card counts as a debt.
    if (amount === 0 || (mode === 'assets' && amount < 0) || (mode === 'debts' && amount > 0))
      continue
    const key = groupBy === 'type' ? wallet.type : groupBy === 'currency' ? wallet.currency : id
    const group = groups.get(key) ?? { signedValue: 0, walletIds: [] }
    group.signedValue += amount
    group.walletIds.push(id)
    groups.set(key, group)
  }

  const items = [...groups]
    .map(([id, group]) => ({ id, signedValue: group.signedValue, value: Math.abs(group.signedValue), walletIds: group.walletIds }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return {
    items: items.map((item, index) => ({
      ...item,
      color: groupBy === 'wallet' ? wallets[item.id]?.color ?? seriesPalette[index % seriesPalette.length]! : seriesPalette[index % seriesPalette.length]!,
      share: total ? item.value / total : 0,
    })),
    total,
  }
}
