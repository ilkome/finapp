import dayjs from 'dayjs'
import type { WalletId, WalletItem, WalletItemRaw, WalletItemWithAmount, Wallets, WalletsRaw } from '~/components/wallets/types'
import { colorsArray } from '~/components/color/colors'
import { random } from '~/assets/js/emo'
import { generateId } from '~~/utils/generateId'

export function normalizeWalletItem(wallet?: WalletItemRaw) {
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
    ? { ...walletBase, creditLimit: wallet?.creditLimit ?? 0, type: 'credit' }
    : { ...walletBase, type: 'cash' }

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
