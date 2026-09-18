import type { MaybeRefOrGetter } from 'vue'

import type { TrnId, TrnsGetterProps } from '~/components/trns/types'

import { useFilter } from '~/components/filter/useFilter'
import { useFilterExtrasMatcher } from '~/components/filter/useFilterExtrasMatcher'
import { useStatFilterStorage } from '~/components/filter/useStatFilterStorage'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

/**
 * The filter scaffold every stat page shares: URL-backed filter, per-page storage, and a getter
 * that narrows the store by the drawer selection (wallets, categories, More tab) in one place.
 */
export function useStatPageFilter(options: {
  canFilterCategories?: boolean
  canFilterWallets?: boolean
  storage?: Storage
  storageKey: MaybeRefOrGetter<string>
}) {
  const trnsStore = useTrnsStore()
  const filter = useFilter({
    canFilterCategories: options.canFilterCategories,
    canFilterWallets: options.canFilterWallets,
  })
  useStatFilterStorage({ filter, storage: options.storage, storageKey: options.storageKey })
  const applyExtras = useFilterExtrasMatcher(filter)

  /** Page-specific props win over the drawer selection (a wallet page passes its own `walletsIds`). */
  function filterTrnsIds(props: Omit<TrnsGetterProps, 'trnsItems'> = {}): TrnId[] {
    return applyExtras(trnsStore.getStoreTrnsIds({
      categoriesIds: filter.categoriesIds.value,
      walletsIds: filter.walletsIds.value,
      ...props,
    }))
  }

  return { filter, filterTrnsIds }
}
