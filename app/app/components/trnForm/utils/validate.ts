import type { TrnItem } from '~/components/trns/types'

import { trnItemSchema } from '~/components/trns/types'

/** The server's check, run before save so a row it would refuse never reaches the upload queue. */
export function validate(values: TrnItem): string | null {
  if (values.type === 'transfer' && values.fromWalletId && values.fromWalletId === values.toWalletId)
    return 'trnForm.errors.transferSameWallet'

  if (values.type === 'transfer' && !values.fromWalletId && !values.toWalletId)
    return 'trnForm.errors.selectWallet'

  if ((values.fromWalletId && !(values.fromAmount! > 0)) || (values.toWalletId && !(values.toAmount! > 0)))
    return values.type === 'transfer' ? 'trnForm.errors.transferAmountEmpty' : 'trnForm.errors.amountEmpty'

  const result = trnItemSchema.safeParse(values)
  if (result.success)
    return null

  const path = result.error.issues[0]?.path ?? []
  if (path.includes('categoryId') || (values.type !== 'transfer' && !values.categoryId))
    return 'trnForm.errors.selectCategory'
  if (values.type !== 'transfer' && !values.fromWalletId && !values.toWalletId)
    return 'trnForm.errors.selectWallet'
  return 'trnForm.errors.amountEmpty'
}
