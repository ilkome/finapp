<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useFilter } from '~/components/filter/useFilter'
import { useStatDate } from '~/components/date/useStatDate'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const { t } = useI18n()
const filter = useFilter()
const route = useRoute()
const trnsStore = useTrnsStore()
provide('filter', filter)

const activeTab = useStorage<MoneyTypeSlugNew>(`dashboard-mini-tab`, 'netIncome')

const selectedTypesMapping = computed(() => {
  const typeMapping = {
    expense: [0, 2],
    income: [1, 2],
    netIncome: [0, 1, 2],
    sum: [0, 1, 2],
    summary: [0, 1, 2],
  }
  const trnsTypes = typeMapping[activeTab.value]

  return trnsTypes ?? []
})

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  trnsTypes: selectedTypesMapping.value,
  walletsIds: filter?.walletsIds?.value,
}, {
  includesChildCategories: true,
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({ storageKey: 'dashboard' })
provide('statConfig', statConfig)

watch(filter.categoriesIds, () => {
  if (filter.categoriesIds.value.length > 0) {
    statConfig.config.value.isShowEmptyCategories = true
  }
  else {
    statConfig.config.value.isShowEmptyCategories = false
  }
})

const statDate = useStatDate({
  key: `finapp-dashboard-`,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

const storageKey = computed(() => `dashboard${activeTab.value}`)

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [0, 2],
}, {
  includesChildCategories: true,
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [1, 2],
}, {
  includesChildCategories: true,
}))

const preCategoriesIds = computed(() => [...filter.categoriesIds.value])
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
        <UiHeaderTitle class="flex min-h-[30px] items-center gap-3 !px-0 py-0 !pl-1">
          <div class="text-lg font-semibold leading-none">
            {{ t('stat.title') }}
          </div>
        </UiHeaderTitle>
      </template>
    </StatHeader>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey
        :trnsIds="expenseTrnsIds"
        :preCategoriesIds
        hasChildren
        type="expense"
      />

      <StatItem
        :storageKey
        :trnsIds="incomeTrnsIds"
        :preCategoriesIds
        hasChildren
        type="income"
      />
    </div>

    <div
      v-else
      class="max-w-7xl px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8"
    >
      <StatItem
        :storageKey
        :type="activeTab"
        :trnsIds="trnsIds"
        :preCategoriesIds
        hasChildren
      />
    </div>
  </UiPage>
</template>
