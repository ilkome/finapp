<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useFilter } from '~/components/filter/useFilter'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()

const filter = useFilter()
const { statHeader } = useStatPageHost()

const legacyTab = localStorage.getItem('dashboard-tab')?.replaceAll('"', '')
const legacyStorageKey = legacyTab ? `dashboard-${legacyTab}` : undefined
const storageKey = 'dashboard'

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  walletsIds: filter?.walletsIds?.value,
}))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const { statConfig } = useStatPageProviders({
  config: { legacyStorageKey, legacyTab, storageKey },
  date: { key: storageKey, legacyKey: legacyStorageKey, maxRange, queryParams: route.query },
  filter,
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

    <BudgetsDashboardCard class="mx-2 mb-2 max-w-7xl lg:mx-4" />

    <StatLayout
      :storageKey
      :trnsIds
      hasChildren
    />
  </UiPage>
</template>
