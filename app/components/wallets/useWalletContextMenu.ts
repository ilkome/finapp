import type { WalletId } from '~/components/wallets/types'

export function useWalletContextMenu(options?: {
  onDelete?: (walletId: WalletId) => void
}) {
  const { t } = useI18n()
  const router = useRouter()

  function getWalletContextMenuItems(walletId: WalletId) {
    const editGroup = [{
      icon: 'lucide:pencil',
      label: t('base.edit'),
      onSelect: () => router.push(`/wallets/${walletId}/edit`),
    }]

    if (!options?.onDelete)
      return [editGroup]

    return [editGroup, [{
      color: 'error' as const,
      icon: 'lucide:trash-2',
      label: t('base.delete'),
      onSelect: () => options.onDelete!(walletId),
    }]]
  }

  return { getWalletContextMenuItems }
}
