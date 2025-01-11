import type { WalletForm, WalletItem, WalletItemBase, WalletItemDirty, Wallets, WalletsDirty } from '~/components/wallets/types'

import { random } from '~/assets/js/emo'
import { colorsArray } from '~/components/color/colors'

export function normalizeWalletItem(wallet?: WalletItemDirty | WalletForm) {
  const walletBase: WalletItemBase = {
    color: wallet?.color ?? random(colorsArray),
    currency: wallet?.currency ?? 'USD',
    desc: wallet?.desc ?? wallet?.description ?? '',
    editedAt: wallet?.editedAt ?? wallet?.edited ?? new Date().getTime(),
    isArchived: wallet?.isArchived ?? wallet?.archived ?? false,
    isExcludeInTotal: wallet?.isExcludeInTotal ?? false,
    isWithdrawal: wallet?.isWithdrawal ?? wallet?.withdrawal ?? false,
    name: wallet?.name ?? '',
    order: wallet?.order ?? 1,
  }

  const walletItem: WalletItem = (wallet?.isCredit || wallet?.type === 'credit')
    ? { ...walletBase, creditLimit: +(wallet?.creditLimit ?? 0), type: 'credit' }
    : { ...walletBase, type: wallet?.type ?? 'cash' }

  // Set type based on the wallet type property
  if (wallet?.type === 'cash' || wallet?.isCash)
    walletItem.type = 'cash'
  if (wallet?.type === 'cashless' || wallet?.isCashless)
    walletItem.type = 'cashless'
  if (wallet?.type === 'debt' || wallet?.isDebt)
    walletItem.type = 'debt'
  if (wallet?.type === 'deposit' || wallet?.isDeposit)
    walletItem.type = 'deposit'

  return walletItem
}

export function normalizeWallets(items: WalletsDirty): Wallets {
  return Object.entries(items).reduce((acc, [walletId, wallet]) => {
    acc[walletId] = normalizeWalletItem(wallet)
    return acc
  }, {} as Wallets)
}
