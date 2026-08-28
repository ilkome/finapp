<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { useFilter } from '~/components/filter/useFilter'
import { collectCategoriesByTrns } from '~/components/stat/categories/collectAndGroup'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatViewController } from '~/components/stat/views/useStatViewController'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()

const filter = useFilter()
const { statHeader } = useStatPageHost()

const legacyTab = localStorage.getItem('dashboard-tab')?.replaceAll('"', '')
const legacyStorageKey = legacyTab ? `dashboard-${legacyTab}` : undefined
const storageKey = 'dashboard'

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  walletsIds: filter?.walletsIds?.value,
}))
const walletSourceTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
}))

const maxRange = computed(() => trnsStore.getRange(walletSourceTrnsIds.value))

const { statConfig, statDate } = useStatPageProviders({
  config: { legacyStorageKey, legacyTab, stableStorage: true, storageKey },
  date: { key: storageKey, legacyKey: legacyStorageKey, maxRange, queryParams: route.query },
  filter,
})

const viewContext = computed(() => {
  const selectedIds = filter.categoriesIds.value
  const rangeTrnsIds = trnsStore.getStoreTrnsIds({ dates: statDate.range.value, trnsIds: trnsIds.value })
  const categoryIds = Object.keys(collectCategoriesByTrns({
    categoriesItems: categoriesStore.items,
    excludedCategoriesIds: categoriesStore.excludedFromStatsIds,
    trnsIds: rangeTrnsIds,
    trnsItems: trnsStore.items ?? {},
  }))
  const parents = new Set(categoryIds.map(id => getParentCategoryIdOrUndefined(categoriesStore.items, id) ?? id))
  return {
    categoryCount: categoryIds.length,
    parentCategoryCount: parents.size,
    range: statDate.range.value,
    selectedCategoryIds: selectedIds,
    selectedWalletIds: filter.walletsIds.value,
  }
})

const statViewController = useStatViewController(statConfig.config, viewContext)
provide(statViewControllerKey, statViewController)
onMounted(() => {
  void statViewController.store.init('dashboard')
})

watch(filter.categoriesIds, () => {
  statConfig.config.value.categories.isShowEmpty = filter.categoriesIds.value.length > 0
})

const lastFilter = useStorage<{
  categoriesIds: CategoryId[]
  walletsIds: WalletId[]
}>('finapp.dashboard.lastFilter', {
  categoriesIds: [],
  walletsIds: [],
}, localStorage, {
  mergeDefaults: true,
})

onActivated(() => {
  filter.setCategories(lastFilter.value.categoriesIds ?? [])
  filter.setWallets(lastFilter.value.walletsIds ?? [])
})

onDeactivated(() => {
  lastFilter.value.categoriesIds = filter.categoriesIds.value
  lastFilter.value.walletsIds = filter.walletsIds.value
})
</script>

<template>
  <UiPage>
    <StatHeader
      ref="statHeader"
      :trnsIds
      compactBottom
      configCategories
      configWallets
    >
      <template #title>
        <UiHeaderTitle>{{ t('stat.title') }}</UiHeaderTitle>
      </template>
    </StatHeader>

    <StatLayout
      :storageKey
      :trnsIds
      :walletSourceTrnsIds
      hasChildren
      showWallets
    />
  </UiPage>
</template>
