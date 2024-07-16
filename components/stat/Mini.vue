<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { AppNav } from '~/components/app/types'

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
  <div class="grid gap-4">
    <div
      class="sticky top-0 z-10 grid gap-2 bg-foreground-2 px-2 py-2"
    >
      <!-- <div
        v-if="props.isShowTotals"
        class="flex flex-wrap gap-8 rounded-lg"
      >
        <StatSum
          v-if="totals.expense"
          :amount="-totals.expense"
          isTotal
          type="expense"
        />
        <StatSum
          v-if="totals.income"
          :amount="totals.income"
          isTotal
          type="income"
        />
        <StatSum
          v-if="totals.income && totals.expense"
          :amount="totals.sum"
          isTotal
          type="sum"
        />
      </div> -->

      <div class="flex gap-1 overflow-y-auto">
        <Filter
          v-if="props.isShowFilter"
        />

        <StatMenu
          :active="activeTab"
          :isShowIncome="totals.income !== 0"
          :isShowExpense="totals.expense !== 0"
          @click="id => activeTab = id"
        />
      </div>
    </div>

    <!-- Sum -->
    <div class="grid gap-24">
      <StatMiniItem
        v-if="activeTab === 'netIncome' && totals.sum && (totals.expense !== 0 || totals.income !== 0)"
        :storageKey="props.storageKey + activeTab"
        :trnsIds="trnsIds"
        class="-max-w-2xl"
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
        class="grid md:grid-cols-2 gap-24"
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

      <div
        v-if="activeTab === 'sum2'"
      >
        <StatMiniItem4
          v-if="totals.sum && (totals.expense !== 0 || totals.income !== 0)"
          :storageKey="props.storageKey + activeTab"
          :trnsIds="trnsIds"
          class="-max-w-2xl"
          type="sum"
        />
      </div>
    </div>
  </div>
</template>
