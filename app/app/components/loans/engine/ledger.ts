import { startOfMonthCivil } from '~~/utils/date/civil'

import type { LoanCost, LoanTrn } from '~/components/loans/engine/types'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'

/**
 * One pass over every transaction. A transfer INTO a credit wallet is a payment; a transfer out is
 * spending on the product, so only the income side counts. Interest and fees are expenses of the
 * credit wallet itself in the reserved categories.
 */
export function collectCreditTrns(
  trns: Record<TrnId, TrnItem>,
  creditWalletIds: ReadonlySet<WalletId>,
): Map<WalletId, LoanTrn[]> {
  const result = new Map<WalletId, LoanTrn[]>()
  if (!creditWalletIds.size)
    return result

  function push(walletId: WalletId, trn: LoanTrn) {
    const list = result.get(walletId)
    if (list)
      list.push(trn)
    else result.set(walletId, [trn])
  }

  for (const id in trns) {
    const trn = trns[id] as TrnItem | undefined
    if (!trn)
      continue

    if (trn.type === TrnType.Transfer) {
      if (creditWalletIds.has(trn.incomeWalletId))
        push(trn.incomeWalletId, { amount: trn.incomeAmount, date: trn.date, id, kind: 'payment' })
      continue
    }

    const walletId = trn.walletId
    if (!creditWalletIds.has(walletId))
      continue
    if (trn.categoryId === 'loanInterest')
      push(walletId, { amount: trn.amount, date: trn.date, id, kind: 'interest' })
    else if (trn.categoryId === 'loanFine')
      push(walletId, { amount: trn.amount, date: trn.date, id, kind: 'fine' })
  }

  return result
}

/** Interest and fees of one credit wallet, totalled and bucketed by civil month. */
export function costOf(trns: LoanTrn[]): LoanCost {
  const byMonth = new Map<number, { fine: number, interest: number }>()
  let interest = 0
  let fine = 0

  for (const trn of trns) {
    if (trn.kind === 'payment')
      continue
    const month = startOfMonthCivil(trn.date)
    const bucket = byMonth.get(month) ?? { fine: 0, interest: 0 }
    bucket[trn.kind] += trn.amount
    byMonth.set(month, bucket)
    if (trn.kind === 'interest')
      interest += trn.amount
    else fine += trn.amount
  }

  return {
    byMonth: [...byMonth.entries()]
      .map(([month, value]) => ({ month, ...value }))
      .sort((a, b) => a.month - b.month),
    fine,
    interest,
  }
}
