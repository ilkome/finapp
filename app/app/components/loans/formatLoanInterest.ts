import { todayCivilDayEpoch } from '~~/utils/date/civil'

import type { TrnFormValuesWithLoan } from '~/components/loans/types'
import type { Transaction } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

/** The interest the bank took out of a payment: an expense of the credit wallet the transfer went to. */
export function formatLoanInterest(props: TrnFormValuesWithLoan): Transaction | undefined {
  const draft = props.loanInterest

  if (!draft?.isEnabled || draft.amount <= 0 || !props.incomeWalletId)
    return undefined

  return {
    amount: draft.amount,
    categoryId: 'loanInterest',
    date: props.date || todayCivilDayEpoch(),
    type: TrnType.Expense,
    updatedAt: Date.now(),
    walletId: props.incomeWalletId,
  }
}
