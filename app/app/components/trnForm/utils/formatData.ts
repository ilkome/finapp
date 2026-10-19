import { todayCivilDayEpoch } from '~~/utils/date/civil'

import type { TrnFormValuesWithLoan } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'

/** Form values -> the flow shape: expense spends from a wallet, income lands in one, a transfer moves between them. */
export function formatTrn(props: TrnFormValuesWithLoan): TrnItem | false {
  const now = Date.now()
  const base = {
    createdAt: now,
    date: props.date || todayCivilDayEpoch(),
    type: props.trnType,
    updatedAt: now,
    ...(props.description ? { description: props.description } : {}),
  }

  if (props.trnType === 'transfer') {
    const fromWalletId = props.transferOutside === 'from' ? undefined : props.fromWalletId ?? undefined
    const toWalletId = props.transferOutside === 'to' ? undefined : props.toWalletId ?? undefined
    if (!fromWalletId && !toWalletId)
      return false
    return {
      ...base,
      ...(fromWalletId ? { fromAmount: props.amount[1], fromWalletId } : {}),
      ...(toWalletId ? { toAmount: props.amount[2], toWalletId } : {}),
    }
  }

  if (props.trnType === 'adjustment') {
    if (!props.walletId)
      return false
    // An adjustment keeps the side it was created on: `transferType` holds it in the form.
    return props.transferType === 'to'
      ? { ...base, toAmount: props.amount[0], toWalletId: props.walletId }
      : { ...base, fromAmount: props.amount[0], fromWalletId: props.walletId }
  }

  if (!props.categoryId || !props.walletId)
    return false

  return props.trnType === 'income'
    ? { ...base, categoryId: props.categoryId, toAmount: props.amount[0], toWalletId: props.walletId }
    : { ...base, categoryId: props.categoryId, fromAmount: props.amount[0], fromWalletId: props.walletId }
}
