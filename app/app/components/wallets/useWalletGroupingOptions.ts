import type { WalletsGroupedBy } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/**
 * The ways to group wallets - shared by the page's grouping tabs and the selector's
 * grouping dropdown, so both list exactly the same options.
 */
export function useWalletGroupingOptions() {
  const { t } = useI18n()
  const walletsStore = useWalletsStore()

  return computed<{ icon: string, id: WalletsGroupedBy, label: string }[]>(() => [
    { icon: 'lucide:ban', id: 'none', label: t('wallets.page.none') },
    { icon: 'lucide:shapes', id: 'type', label: t('wallets.page.type') },
    ...(walletsStore.currenciesUsed.length > 1
      ? [
          { icon: 'lucide:coins', id: 'currency' as const, label: t('wallets.page.currencies') },
          { icon: 'lucide:folder-tree', id: 'typeCurrency' as const, label: t('wallets.page.typeCurrency') },
          { icon: 'lucide:folder-tree', id: 'currencyType' as const, label: t('wallets.page.currencyType') },
        ]
      : []),
  ])
}
