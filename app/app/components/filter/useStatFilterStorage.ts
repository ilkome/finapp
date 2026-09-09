import type { MaybeRefOrGetter } from 'vue'

import { useStorage } from '@vueuse/core'
import { computed, toValue, watch } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { WalletId } from '~/components/wallets/types'

type StoredStatFilters = {
  categoriesIds: CategoryId[]
  walletsIds: WalletId[]
}

type UseStatFilterStorageOptions = {
  filter: FilterProvider
  storage?: Storage
  storageKey: MaybeRefOrGetter<string>
}

export function statFilterStorageKey(storageKey: MaybeRefOrGetter<string>) {
  return computed(() => `${toValue(storageKey)}-filters`)
}

export function useStatFilterStorage({ filter, storage = localStorage, storageKey }: UseStatFilterStorageOptions) {
  const route = useRoute()
  let isInitialActivation = true
  const storedFilters = useStorage<StoredStatFilters>(statFilterStorageKey(storageKey), {
    categoriesIds: [],
    walletsIds: [],
  }, storage, { mergeDefaults: true })

  function save() {
    storedFilters.value = {
      categoriesIds: [...filter.categoriesIds.value],
      walletsIds: [...filter.walletsIds.value],
    }
  }

  function restore() {
    if (route.query.filterCategories !== undefined || route.query.filterWallets !== undefined) {
      save()
      return
    }
    filter.applyFilter(storedFilters.value.walletsIds, storedFilters.value.categoriesIds)
  }

  watch([filter.categoriesIds, filter.walletsIds], save)
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
