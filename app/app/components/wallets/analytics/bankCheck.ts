import type { BankReports } from '~/components/bankReports/types'
import type { Trns } from '~/components/trns/types'
import type { WalletId, Wallets } from '~/components/wallets/types'

import { walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'

export type BankMismatch = {
  /** Bank minus calculated, in the wallet's currency. */
  diff: number
  walletId: WalletId
}

/** Wallets whose bank balance differs from the calculated one on the bank's balance day. */
export function bankMismatches(trns: Trns, wallets: Wallets, reports: BankReports, walletIds: WalletId[]): BankMismatch[] {
  const checked = walletIds.filter(id => wallets[id] && reports[id]?.balanceDate !== undefined)
  const days = [...new Set(checked.map(id => reports[id]!.balanceDate!))].sort((a, b) => a - b)
  const balances = walletBalancesAt(trns, wallets, days)
  return checked
    .map(id => ({
      diff: reports[id]!.balanceAmount! - (balances[days.indexOf(reports[id]!.balanceDate!)]![id] ?? 0),
      walletId: id,
    }))
    .filter(item => item.diff !== 0)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
}
