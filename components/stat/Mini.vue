<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { AppNav } from '~/components/app/types'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  walletsIds?: WalletId[]
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const activeTab = useStorage<AppNav>('activeTabStatIn', 'sum')

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoriesIds,
  walletsIds: props.walletsIds,
}, {
  includesChildCategories: true,
}))

const expenseTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2,
  ),
)

const incomeTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2,
  ),
)

const totals = computed(() => getTotalOfTrnsIds(trnsIds.value))
</script>

<template>
  <div class="grid gap-4">
    <div
      v-if="totals.income || totals.expense"
      class="grid gap-2"
    >
      <div class="flex flex-wrap gap-8 _bg-item-3 _p-4 rounded-lg py-3">
        <StatSum
          v-if="totals.expense"
          :amount="totals.expense"
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
      </div>

      <Filter class="grow" />

      <StatMenu2
        :active="activeTab"
        :isShowIncome="totals.income !== 0"
        :isShowExpense="totals.expense !== 0"
        @click="id => activeTab = id"
      />
    </div>

    <!-- Sum -->
    <!-- <div
      v-if="activeTab === 'sum' && totals.sum && (totals.expense !== 0 && totals.income !== 0)"
      class="grid @3xl/main_grid-cols-2 gap-24"
    >
      <StatMiniItem
        :trnsIds="trnsIds"
        type="sum"
      />
    </div> -->

    <div class="grid md_grid-cols-2 gap-24">
      <!-- <div>
        <pre>{{ totals.expense }}</pre>
        <pre>{{ expenseTrnsIds.length }}</pre>
        <br>
        <pre>{{ totals.income }}</pre>
        <pre>{{ incomeTrnsIds.length }}</pre>
      </div> -->

      <!-- Expense -->
      <StatMiniItem
        v-if="(activeTab === 'sum' || activeTab === 'expense') && expenseTrnsIds.length > 0"
        :trnsIds="expenseTrnsIds"
        type="expense"
      />

      <!-- Income -->
      <StatMiniItem
        v-if="(activeTab === 'sum' || activeTab === 'income') && incomeTrnsIds.length > 0"
        :trnsIds="incomeTrnsIds"
        type="income"
      />

      <!-- Trns -->
      <TrnsList
        v-if="activeTab === 'trns' || (!totals.income && !totals.expense)"
        :trnsIds
        isShowHeader
        isShowFilter
      />
    </div>
  </div>
</template>
