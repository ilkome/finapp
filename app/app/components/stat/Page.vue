<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import { useMediaQuery, useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/config/useStatConfig'
import { useStatDate } from '~/components/stat/date/useStatDate'
import { statConfigKey, statDashboardKey, statDateKey, statStickyNavKey, statStickyTopKey } from '~/components/stat/injectionKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()

const filter = useFilter()
provide(filterKey, filter)

// Dashboard: the date/filter nav row pins immediately below the page header.
provide(statDashboardKey, true)
provide(statStickyNavKey, true)

type StatHeaderInstance = ComponentPublicInstance & {
  stickyMainElement: HTMLElement | null
  stickyRootElement: HTMLElement | null
}

const statHeader = useTemplateRef<StatHeaderInstance>('statHeader')
const isDesktopHeader = useMediaQuery('(min-width: 768px)')
const statHeaderElement = computed(() => isDesktopHeader.value
  ? statHeader.value?.stickyRootElement
  : statHeader.value?.stickyMainElement)
const { height: statStickyTop } = useElementSize(statHeaderElement)
provide(statStickyTopKey, statStickyTop)

const activeTab = useStorage<StatTabSlug>('dashboard-tab', 'summary')
const storageKey = computed(() => `dashboard-${activeTab.value}`)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  walletsIds: filter?.walletsIds?.value,
}))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({
  storageKey: storageKey.value,
})
provide(statConfigKey, statConfig)

const statDate = useStatDate({ key: storageKey.value, maxRange, queryParams: route.query })
provide(statDateKey, statDate)

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
      v-model:activeTab="activeTab"
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
      :activeTab
      :storageKey
      :trnsIds
      hasChildren
    />
  </UiPage>
</template>
