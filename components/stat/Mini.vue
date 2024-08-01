<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { StatTabs } from '~/components/app/types'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  isShowFilter?: boolean
  isShowTotals?: boolean
  storageKey?: string
  walletsIds?: WalletId[]
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const activeTab = useStorage<StatTabs>(`${props.storageKey}-mini-tab`, 'netIncome')

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoriesIds,
  walletsIds: props.walletsIds,
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
  <div class="grid gap-0">
    <!-- <pre>{{ activeTab }}</pre>
    <pre>{{ trnsIds.length }}</pre>
    <pre>{{ props.categoriesIds }}</pre>
    <pre>{{ props.walletsIds }}</pre> -->

    <!-- Sum -->
    <div class="overflow-hidden">
      <div class="flex gap-1 overflow-y-auto px-2 pt-2 lg:px-4 xl:px-16">
        <Filter v-if="props.isShowFilter" />

        <StatMenu
          :active="activeTab"
          :isShowIncome="totals.income !== 0"
          :isShowExpense="totals.expense !== 0"
          @click="id => activeTab = id"
        />
      </div>

      <StatMiniItem
        v-if="activeTab === 'netIncome' && totals.sum && (totals.expense !== 0 || totals.income !== 0)"
        :storageKey="props.storageKey + activeTab"
        :trnsIds="trnsIds"
        class="-max-w-2xl lg:gap-8 max-w-6xl lg:px-4 xl:px-16 xl:py-2"
        type="sum"
      />

      <!-- Expense -->
      <StatMiniItem
        v-if="(activeTab === 'expense') && expenseTrnsIds.length > 0"
        :trnsIds="expenseTrnsIds"
        :storageKey="props.storageKey + activeTab"
        type="expense"
      />

      <!-- Income -->
      <StatMiniItem
        v-if="(activeTab === 'income') && incomeTrnsIds.length > 0"
        :trnsIds="incomeTrnsIds"
        :storageKey="props.storageKey + activeTab"
        type="income"
      />

      <div
        v-if="activeTab === 'sum'"
        class="grid md:grid-cols-2 gap-4 lg:gap-8 max-w-6xl lg:px-4 xl:px-16 xl:py-2"
      >
        <!-- Expense -->
        <StatMiniItem
          v-if="(activeTab === 'sum') && expenseTrnsIds.length > 0"
          :trnsIds="expenseTrnsIds"
          :storageKey="props.storageKey + activeTab"
          type="expense"
        />

        <!-- Income -->
        <StatMiniItem
          v-if="(activeTab === 'sum') && incomeTrnsIds.length > 0"
          :trnsIds="incomeTrnsIds"
          :storageKey="props.storageKey + activeTab"
          type="income"
        />
      </div>
    </div>
  </div>
</template>
