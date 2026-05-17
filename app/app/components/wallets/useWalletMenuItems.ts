import type { WalletId } from '~/components/wallets/types'

import { useWalletCreditView } from '~/components/wallets/useWalletCreditView'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

type Item = { color?: 'error', icon: string, label: string, onSelect: () => void }

export function useWalletMenuItems() {
  const { t } = useI18n()
  const router = useRouter()
  const walletsStore = useWalletsStore()

  return {
    creditView(walletId: WalletId): Item | null {
      const wallet = walletsStore.itemsComputed[walletId]
      if (!wallet || wallet.type !== 'credit' || wallet.creditLimit <= 0)
        return null
      const { cycle, view } = useWalletCreditView(walletId)
      return {
        icon: view.value === 'debt' ? 'lucide:wallet' : 'lucide:credit-card',
        label: view.value === 'debt'
          ? t('wallets.creditView.showAvailable')
          : t('wallets.creditView.showDebt'),
        onSelect: cycle,
      }
    },

    delete(walletId: WalletId, onDelete: (id: WalletId) => void): Item {
      return {
        color: 'error',
        icon: 'lucide:trash-2',
        label: t('base.delete'),
        onSelect: () => onDelete(walletId),
      }
    },

    edit(walletId: WalletId, opts?: { onEdit?: (id: WalletId) => void, returnBack?: boolean }): Item {
      return {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => opts?.onEdit
          ? opts.onEdit(walletId)
          : router.push(opts?.returnBack
              ? `/wallets/${walletId}/edit?returnBack=1`
              : `/wallets/${walletId}/edit`),
      }
    },

    open(walletId: WalletId): Item {
      return {
        icon: 'lucide:square-arrow-out-up-right',
        label: t('base.open'),
        onSelect: () => router.push(`/wallets/${walletId}`),
      }
    },
  }
}
