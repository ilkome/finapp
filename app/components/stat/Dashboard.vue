<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useFilter } from '~/components/filter/useFilter'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const filter = useFilter()
const route = useRoute()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()
provide('filter', filter)

const activeTab = useStorage<StatTabs>(`dashboard-mini-tab`, 'netIncome')

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.catsIds?.value,
  walletsIds: filter?.walletsIds?.value,
}, {
  includesChildCategories: true,
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({ storageKey: 'dashboard' })
provide('statConfig', statConfig)

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

const sortedFilterWalletsIds = computed(() => {
  const filteredIds = filter.walletsIds.value
  const showedIds = walletsStore.sortedIds.slice(0, statConfig.config.value.showedWallets)
  return [...new Set([...showedIds, ...filteredIds])]
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <div class="bg-foreground-3 sticky top-0 z-10 grid max-w-6xl gap-2 pb-2 lg:px-4 xl:py-2">
    <div class="grid gap-2 px-2 pt-2">
      <div class="flex items-center gap-1 overflow-x-auto ">
        <FilterSelector
          isShowCategories
          isShowWallets
        />
        <StatMenu
          :active="activeTab"
          @click="id => activeTab = id"
        />
        <StatConfigPopover isShowWallets />
      </div>
      <FilterSelected
        v-if="filter.isShow?.value && filter.catsIds.value.length > 0"
        isShowCategories
        isShowWallets
      />
    </div>
  </div>

  <div class="max-w-6xl gap-2 pb-2 lg:px-4 xl:py-2">
    <div
      v-if="statConfig.config.value.showedWallets > 0 || filter.walletsIds.value.length > 0"
      class="flex gap-1 overflow-x-auto px-2 py-px"
    >
      <WalletsItem
        v-for="walletId in sortedFilterWalletsIds"
        :key="walletId"
        :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
        :walletId
        :wallet="walletsStore.itemsWithAmount?.[walletId]"
        alt
        @click="onClickWallet(walletId)"
      />
    </div>
  </div>

  <!-- NetIncome -->
  <div
    v-if="activeTab === 'netIncome'"
    class="max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
  >
    <StatItemForCategory

      :storageKey="storageKey + activeTab"
      :trnsIds="trnsIds"
      hasChildren
      type="sum"
    />

    <!-- <StatItem
      v-if="activeTab === 'netIncome'"
      :storageKey="storageKey + activeTab"
      :trnsIds="trnsIds"
      class=""
      type="sum"
    /> -->
  </div>

  <!-- Summary -->
  <div
    v-if="activeTab === 'sum'"
    class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
  >
    <!-- Expense -->
    <!-- <StatItem
      :storageKey="storageKey + activeTab"
      :trnsIds="expenseTrnsIds"
      type="expense"
    /> -->
    <StatItemForCategory
      :storageKey="storageKey + activeTab"
      :trnsIds="expenseTrnsIds"
      hasChildren
      type="expense"
    />

    <!-- Income -->
    <!-- <StatItem
      :storageKey="storageKey + activeTab"
      :trnsIds="incomeTrnsIds"
      type="income"
    /> -->
    <StatItemForCategory
      :storageKey="storageKey + activeTab"
      :trnsIds="incomeTrnsIds"
      hasChildren
      type="income"
    />
  </div>
</template>

<style>
.popover-el {
  @apply border-item-5 border-b pb-4 last:border-b-0 last:pb-0;
}
</style>
