import type { MaybeRefOrGetter } from 'vue'

import { useStorage } from '@vueuse/core'
import { computed, toValue, watch } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { FilterExtras } from '~/components/filter/extras'
import type { FilterProvider } from '~/components/filter/types'
import type { WalletId } from '~/components/wallets/types'

import { defaultFilterExtras, extrasQueryKeys } from '~/components/filter/extras'

type StoredStatFilters = {
  categoriesIds: CategoryId[]
  extras: FilterExtras
  walletsIds: WalletId[]
}

type UseStatFilterStorageOptions = {
  filter: FilterProvider
  storage?: Storage
  storageKey: MaybeRefOrGetter<string>
}

function statFilterStorageKey(storageKey: MaybeRefOrGetter<string>) {
  return computed(() => `${toValue(storageKey)}-filters`)
}

export function useStatFilterStorage({ filter, storage = localStorage, storageKey }: UseStatFilterStorageOptions) {
  const route = useRoute()
  let isInitialActivation = true
  const storedFilters = useStorage<StoredStatFilters>(statFilterStorageKey(storageKey), {
    categoriesIds: [],
    extras: { ...defaultFilterExtras },
    walletsIds: [],
  }, storage, { mergeDefaults: true })

  function save() {
    storedFilters.value = {
      categoriesIds: [...filter.categoriesIds.value],
      extras: { ...filter.extras.value },
      walletsIds: [...filter.walletsIds.value],
    }
  }

  function restore() {
    const queryKeys = ['filterCategories', 'filterWallets', ...extrasQueryKeys]
    if (queryKeys.some(key => route.query[key] !== undefined)) {
      save()
      return
    }
    filter.applyFilter({
      categories: storedFilters.value.categoriesIds,
      // mergeDefaults only fills a missing `extras`; a partial object from an older payload still needs the spread
      extras: { ...defaultFilterExtras, ...storedFilters.value.extras },
      wallets: storedFilters.value.walletsIds,
    })
  }

  watch([filter.categoriesIds, filter.walletsIds, filter.extras], save)
  onMounted(restore)
  onActivated(() => {
    if (isInitialActivation) {
      isInitialActivation = false
      return
    }
    restore()
  })
  onDeactivated(save)

  return { restore, storedFilters }
}
