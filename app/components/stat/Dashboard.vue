<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()

const filter = useFilter()
provide('filter', filter)

const activeTab = useStorage<StatTabSlug>('dashboard-tab', 'summary')
const storageKey = computed(() => `dashboard-${activeTab.value}`)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  walletsIds: filter?.walletsIds?.value,
}, { includesChildCategories: true }))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({
  storageKey: storageKey.value,
})
provide('statConfig', statConfig)

const statDate = useStatDate({ key: storageKey.value, maxRange, queryParams: route.query })
provide('statDate', statDate)

watch(filter.categoriesIds, () => {
  statConfig.config.value.isShowEmptyCategories = filter.categoriesIds.value.length > 0
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
      :menu="{
        active: activeTab,
        click: id => activeTab = id,
      }"
      :filter="{
        isShowCategories: true,
        isShowWallets: true,
      }"
      :config="{
        isShowWallets: true,
      }"
    >
      <template #title>
        <UiHeaderTitle>{{ t('stat.title') }}</UiHeaderTitle>
      </template>
    </StatHeader>

    <StatWrap
      :activeTab
      :range="statDate.range.value"
      :storageKey
      :trnsIds
      hasChildren
    />
  </UiPage>
</template>
