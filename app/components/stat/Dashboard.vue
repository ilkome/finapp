<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { MoneyTypeSlugNew } from '~/components/stat/types'

import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()

const filter = useFilter()
provide('filter', filter)

const activeTab = useStorage<MoneyTypeSlugNew>(`dashboard-tab`, 'netIncome')
const storageKey = computed(() => `dashboard-${activeTab.value}`)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  // trnsTypes: getTypesMapping(activeTab.value),
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
</script>

<template>
  <UiPage>
    <StatHeader
      :menu="{
        active: activeTab,
        click: id => activeTab = id,
      }"
      :maxRange
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

    <StatItemWrap
      :activeTab
      :trnsIds
      :storageKey
      hasChildren
    />
  </UiPage>
</template>
