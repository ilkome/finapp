<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useFilter } from '~/components/filter/useFilter'
import { calculateBestGranularityBy } from '~/components/stat/date/params'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
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
const walletSourceTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
}))

const baseMaxRange = computed(() => trnsStore.getRange(walletSourceTrnsIds.value))
const contextualMaxRange = shallowRef<Range | null>(null)
const maxRange = computed(() => contextualMaxRange.value ?? baseMaxRange.value)

const { contentWidth, statConfig, statDate } = useStatPageProviders({
  config: { legacyStorageKey, legacyTab, stableStorage: true, storageKey },
  date: { key: storageKey, legacyKey: legacyStorageKey, maxRange, queryParams: route.query },
  filter,
})
const contextRange = computed(() => resolveStatSelectionRange(
  statDate.range.value,
  statDate.selectedInterval.value,
  statDate.params.value.intervalSelected,
))

watch(contextualMaxRange, (range) => {
  if (!statDate.params.value.isShowMaxRange)
    return
  const granularityBy = calculateBestGranularityBy(range ?? baseMaxRange.value)
  if (statDate.params.value.granularityBy !== granularityBy || statDate.params.value.granularityDuration !== 1)
    statDate.setGranularity({ granularityBy, granularityDuration: 1 })
}, { immediate: true })

const { hiddenPanels } = useStatPageViews({
  contentWidth,
  filter,
  range: contextRange,
  statConfig,
  trnsIds,
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
      compactBottom
    >
      <template #title>
        <UiHeaderTitle>{{ t('stat.title') }}</UiHeaderTitle>
      </template>
    </StatHeader>

    <StatLayout
      :hiddenPanels
      :storageKey
      :trnsIds
      :walletSourceTrnsIds
      hasChildren
      showWallets
      @contextualMaxRange="contextualMaxRange = $event"
    />
  </UiPage>
</template>
