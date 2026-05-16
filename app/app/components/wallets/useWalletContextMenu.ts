import type { WalletId } from '~/components/wallets/types'

export function useWalletContextMenu(options?: {
  excludeOpen?: boolean
  onDelete?: (walletId: WalletId) => void
  onEdit?: (walletId: WalletId) => void
  returnBackOnSave?: boolean
}) {
  const { t } = useI18n()
  const router = useRouter()

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
