import type { WalletId } from '~/components/wallets/types'

import { useWalletCreditView } from '~/components/wallets/useWalletCreditView'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletContextMenu(options?: {
  excludeOpen?: boolean
  onDelete?: (walletId: WalletId) => void
  onEdit?: (walletId: WalletId) => void
  returnBackOnSave?: boolean
  withCreditView?: boolean
}) {
  const { t } = useI18n()
  const router = useRouter()
  const walletsStore = useWalletsStore()

  function getWalletContextMenuItems(walletId: WalletId) {
    const editPath = options?.returnBackOnSave
      ? `/wallets/${walletId}/edit?returnBack=1`
      : `/wallets/${walletId}/edit`

    const editGroup = [
      ...(!options?.excludeOpen
        ? [{
            icon: 'lucide:square-arrow-out-up-right',
            label: t('base.open'),
            onSelect: () => router.push(`/wallets/${walletId}`),
          }]
        : []),
      {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => options?.onEdit
          ? options.onEdit(walletId)
          : router.push(editPath),
      },
    ]

    const groups: any[][] = [editGroup]

    const wallet = walletsStore.itemsComputed[walletId]
    if (options?.withCreditView && wallet?.type === 'credit' && wallet.creditLimit > 0) {
      const { cycle, view } = useWalletCreditView(walletId)
      groups.unshift([{
        icon: view.value === 'debt' ? 'lucide:wallet' : 'lucide:credit-card',
        label: view.value === 'debt'
          ? t('wallets.creditView.showAvailable')
          : t('wallets.creditView.showDebt'),
        onSelect: cycle,
      }])
    }

    if (options?.onDelete) {
      groups.push([{
        color: 'error' as const,
        icon: 'lucide:trash-2',
        label: t('base.delete'),
        onSelect: () => options.onDelete!(walletId),
      }])
    }

    return groups
  }

  return { getWalletContextMenuItems }
}
