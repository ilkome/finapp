import type { Transaction, Transfer } from '~/components/trns/types'

import { trnItemSchema, TrnType } from '~/components/trns/types'

export function validate(values: Transaction | Transfer): string | null {
  const result = trnItemSchema.safeParse(values)

  if (!result.success) {
    const issue = result.error.issues[0]

    if (values.type === TrnType.Transfer) {
      if (issue?.path?.includes('incomeWalletId') || issue?.path?.includes('expenseWalletId'))
        return 'trnForm.errors.selectWallet'
      return 'trnForm.errors.transferAmountEmpty'
    }

    if (issue?.path?.includes('amount'))
      return 'trnForm.errors.amountEmpty'
    if (issue?.path?.includes('walletId'))
      return 'trnForm.errors.selectWallet'
    if (issue?.path?.includes('categoryId'))
      return 'trnForm.errors.selectCategory'

    return 'trnForm.errors.amountEmpty'
  }

  if (values.type === TrnType.Transfer && values.incomeWalletId === values.expenseWalletId)
    return 'trnForm.errors.transferSameWallet'

  return null
}
