import type { WalletsGroupedBy } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/**
 * The three ways to group wallets - shared by the page's grouping tabs and the selector's
 * grouping dropdown, so both list exactly the same options.
 */
export function useWalletGroupingOptions() {
  const { t } = useI18n()
  const walletsStore = useWalletsStore()

  return computed<{ id: WalletsGroupedBy, label: string }[]>(() => [
    { id: 'none', label: t('wallets.page.none') },
    { id: 'type', label: t('wallets.page.type') },
    ...(walletsStore.currenciesUsed.length > 1
      ? [{ id: 'currency' as const, label: t('wallets.page.currencies') }]
      : []),
  ])
}
