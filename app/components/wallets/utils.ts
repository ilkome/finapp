import type { WalletItemDirty } from '~/components/wallets/types'

import { walletBaseSchema, walletDirtySchema, walletItemSchema } from '~/components/wallets/types'

export function normalizeWalletItem(wallet: WalletItemDirty) {
  const parsedGood = walletItemSchema.safeParse(wallet)
  const parsed = walletDirtySchema.safeParse(wallet)

  if (parsedGood.success) {
    return {
      error: false,
      values: wallet,
    }
  }

  if (!parsed.success) {
    return {
      error: false,
      values: walletItemSchema.parse({ type: 'cash' }),
    }
  }

  const data = parsed.data
  const base = walletBaseSchema.parse({
    color: data.color,
    currency: data.currency,
    desc: data.desc ?? data.description,
    editedAt: data.editedAt ?? data.edited,
    isArchived: data.isArchived ?? data.archived,
    isExcludeInTotal: data.isExcludeInTotal,
    isWithdrawal: data.isWithdrawal ?? data.withdrawal,
    name: data.name,
    order: data.order,
  })

  let type = data.type
  if (!type) {
    if (data.isCredit)
      type = 'credit'
    else if (data.isCash)
      type = 'cash'
    else if (data.isCashless)
      type = 'cashless'
    else if (data.isDebt)
      type = 'debt'
    else if (data.isDeposit)
      type = 'deposit'
    else type = 'cash'
  }

  const normalizeWalletItem = walletItemSchema.parse({
    ...base,
    ...(type === 'credit'
      ? { creditLimit: +(data.creditLimit ?? 0) }
      : { type }
    ),
  })

  if (!parsedGood.success) {
    return {
      error: true,
      values: normalizeWalletItem,
    }
  }

  return {
    error: false,
    values: normalizeWalletItem,
  }
}
