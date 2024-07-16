<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { AppNav } from '~/components/app/types'
import type { MoneyTypeSlug } from '~/components/stat/types'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  isShowFilter?: boolean
  isShowTotals?: boolean
  storageKey?: string
  walletsIds?: WalletId[]
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const activeTab = useStorage<AppNav>(`${props.storageKey}-mini-tab`, 'sum')
const netTab = useStorage<MoneyTypeSlug>(`${props.storageKey}-netTab`, 'expense')

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

const selectedTrnsIds = computed(() => {
  if (netTab.value === 'income')
    return incomeTrnsIds.value
  if (netTab.value === 'expense')
    return expenseTrnsIds.value

  return trnsIds.value
})
</script>

<template>
  <div class="grid h-full overflow-hidden">
    <StatMiniItem2
      v-if="activeTab === 'netIncome' && totals.sum && (totals.expense !== 0 || totals.income !== 0)"
      :storageKey="props.storageKey + activeTab"
      :trnsIds="trnsIds"
      :selectedTrnsIds="selectedTrnsIds"
      :netTab
      class="-max-w-2xl"
      type="sum"
      @onChangeNetTab="id => { netTab = id }"
    />

    <!-- <pre>activeTab: {{ activeTab }}</pre>
    <pre>netTab: {{ netTab }}</pre>

    <Filter
      v-if="props.isShowFilter"
      class="grow"
    />

    <StatMenu
      :active="activeTab"
      :isShowIncome="totals.income !== 0"
      :isShowExpense="totals.expense !== 0"
      @click="id => activeTab = id"
    /> -->
  </div>
</template>
