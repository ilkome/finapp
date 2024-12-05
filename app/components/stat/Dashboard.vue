<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useFilter } from '~/components/filter/useFilter'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const filter = useFilter()
const route = useRoute()
const trnsStore = useTrnsStore()
provide('filter', filter)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
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

const activeTab = useStorage<StatTabs>(`dashboard-mini-tab`, 'netIncome')
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
          <UiIconStat class="size-5" />
          <div class="text-lg font-semibold leading-none">
            {{ t('stat.title') }}
          </div>
        </UiHeaderTitle>
      </template>
    </StatHeader>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey
        :trnsIds="trnsIds"
        :preCategoriesIds
        hasChildren
        type="sum"
      />

      <div class="invisible max-w-sm md:visible">
        <UiToggle2
          :initStatus="true"
          class="hidden md:grid md:max-w-xl"
          openPadding="!pb-6"
          storageKey="finapp-wallets-currencies"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle8
              :isShown
              @click="toggle"
            >
              {{ t('dates.selector.title') }}
            </UiTitle8>
          </template>

          <StatDateSelector
            :maxRange
          />
        </UiToggle2>
      </div>
    </div>

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
  </UiPage>
</template>
