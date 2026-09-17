import type { ComputedRef, Ref } from 'vue'

import type { FilterProvider } from '~/components/filter/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsStore } from '~/components/trns/useTrnsStore'

/** Wallet chips above the report narrow the trns set without touching the URL filter. */
export function useStatQuickWallets({ filter, trnsIds }: { filter: FilterProvider, trnsIds: Ref<TrnId[]> | ComputedRef<TrnId[]> }) {
  const trnsStore = useTrnsStore()
  const quickWalletIds = ref<WalletId[]>([])
  const quickWalletTrnsIds = computed(() => quickWalletIds.value.length
    ? trnsStore.getStoreTrnsIds({ trnsIds: trnsIds.value, walletsIds: quickWalletIds.value })
    : trnsIds.value)

  watch(filter.walletsIds, (walletIds) => {
    if (walletIds.length > 0)
      quickWalletIds.value = []
  })

  return { quickWalletIds, quickWalletTrnsIds }
}
