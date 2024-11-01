import dayjs from 'dayjs'
import type { WalletForm, WalletItem, WalletItemRaw, Wallets, WalletsRaw } from '~/components/wallets/types'
import { colorsArray } from '~/components/color/colors'
import { random } from '~/assets/js/emo'

export function normalizeWalletItem(wallet?: WalletItemRaw | WalletForm) {
  const walletBase = {
    color: wallet?.color ?? random(colorsArray),
    currency: wallet?.currency ?? 'USD',
    editedAt: wallet?.editedAt ?? wallet?.edited ?? dayjs().valueOf(),
    isArchived: wallet?.isArchived ?? wallet?.archived ?? false,
    isExcludeInTotal: wallet?.isExcludeInTotal ?? false,
    isWithdrawal: wallet?.isWithdrawal ?? wallet?.withdrawal ?? false,
    name: wallet?.name,
    order: wallet?.order ?? 1,
  }

  const walletItem: WalletItem = (wallet?.isCredit || wallet?.type === 'credit')
    ? { ...walletBase, creditLimit: +(wallet?.creditLimit ?? 0), type: 'credit' }
    : { ...walletBase, type: wallet?.type ?? 'cash' }

  if (wallet?.isCash)
    walletItem.type = 'cash'
  if (wallet?.isCashless)
    walletItem.type = 'cashless'
  if (wallet?.isDebt)
    walletItem.type = 'debt'
  if (wallet?.isDeposit)
    walletItem.type = 'deposit'

  return walletItem
}

export function normalizeWallets(items: WalletsRaw | WalletItem): Wallets {
  return Object.entries(items).reduce((acc, [walletId, wallet]) => {
    acc[walletId] = normalizeWalletItem(wallet)
    return acc
  }, {} as Wallets)
}
