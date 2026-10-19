import { todayCivilDayEpoch } from '~~/utils/date/civil'

import type { TrnFormValuesWithLoan } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'

/** The interest the bank took out of a payment: an expense of the credit wallet the transfer went to. */
export function formatLoanInterest(props: TrnFormValuesWithLoan): TrnItem | undefined {
  const draft = props.loanInterest

  // Interest is part of the payment, so it can never exceed the transferred amount.
  if (!draft?.isEnabled || draft.amount <= 0 || draft.amount > (props.amount[2] ?? 0) || !props.toWalletId)
    return undefined

  const now = Date.now()
  return {
    categoryId: 'loan_interest',
    createdAt: now,
    date: props.date || todayCivilDayEpoch(),
    fromAmount: draft.amount,
    fromWalletId: props.toWalletId,
    type: 'expense',
    updatedAt: now,
  }
}
