<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { getStyles } from '~/components/ui/getStyles'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  isShowFilter?: boolean
  isShowTotals?: boolean
  storageKey: string
  walletsIds?: WalletId[]
}>()

const filter = inject('filter') as FilterProvider
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const { config, updateConfig } = useStatConfig({ storageKey: props.storageKey })
const { getTotalOfTrnsIds } = useAmount()

const activeTab = useStorage<StatTabs>(`${props.storageKey}-mini-tab`, 'netIncome')

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter.catsIds.value.length > 0 ? filter.catsIds.value : props.categoriesIds,
  walletsIds: filter.walletsIds.value.length > 0 ? filter.walletsIds.value : props.walletsIds,
}, {
  includesChildCategories: true,
}))

const expenseTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2,
  ).sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)

const incomeTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2,
  ).sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)

const totals = computed(() => getTotalOfTrnsIds(trnsIds.value))
</script>

<template>
  <div class="bg-foreground-3 sticky top-0 z-10 max-w-6xl pb-2 lg:gap-8 lg:px-4 xl:py-2">
    <div class="grid gap-2 px-2 pt-2">
      <div class="flex items-center gap-1 overflow-x-auto ">
        <FilterSelector v-if="props.isShowFilter" />
        <StatMenu
          :active="activeTab"
          @click="id => activeTab = id"
        />
        <StatConfigPopover
          :config="config"
          isShowWallets
          @updateConfig="updateConfig"
        />
      </div>
      <FilterSelected v-if="filter.isShow?.value" />
    </div>

    <div
      v-if="config.showedWallets > 0"
      class="flex gap-1 overflow-hidden overflow-x-auto p-2 pb-0"
    >
      <WalletsItem
        v-for="walletId in walletsStore.sortedIds.slice(0, config.showedWallets)"
        :key="walletId"
        :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
        :walletId
        :wallet="walletsStore.itemsWithAmount?.[walletId]"
        alt
        :class="getStyles('item', ['alt', 'rounded'])"
        @click="filter.toggleWalletId(walletId)"
      />
    </div>
  </div>

  <!-- NetIncome -->
  <StatItem
    v-if="activeTab === 'netIncome' && totals.sum && (totals.expense !== 0 || totals.income !== 0)"
    :storageKey="props.storageKey + activeTab"
    :trnsIds="trnsIds"
    :config
    class="-max-w-2xl max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
    type="sum"
    @updateConfig="updateConfig"
  />

  <!-- Summary -->
  <div
    v-if="activeTab === 'sum'"
    class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
  >
    <!-- Expense -->
    <StatItem
      v-if="(activeTab === 'sum') && expenseTrnsIds.length > 0"
      :config
      :storageKey="props.storageKey + activeTab"
      :trnsIds="expenseTrnsIds"
      type="expense"
      @updateConfig="updateConfig"
    />

    <!-- Income -->
    <StatItem
      v-if="(activeTab === 'sum') && incomeTrnsIds.length > 0"
      :config
      :storageKey="props.storageKey + activeTab"
      :trnsIds="incomeTrnsIds"
      type="income"
      @updateConfig="updateConfig"
    />
  </div>
</template>

<style>
.popover-el {
  @apply border-item-5 border-b pb-4 last:border-b-0 last:pb-0;
}
</style>
