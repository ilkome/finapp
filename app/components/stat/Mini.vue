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
const filteredWallets = ref<WalletId[]>([])

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoriesIds,
  walletsIds: filteredWallets.value.length > 0 ? filteredWallets.value : props.walletsIds,
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
  <div class="bg-foreground-3 z-10 max-w-6xl pb-2 lg:sticky lg:top-0 lg:gap-8 lg:px-4 xl:py-2">
    <div class="flex gap-1 overflow-x-auto p-2 pb-0 ">
      <Filter v-if="props.isShowFilter" />

      <StatMenu
        :active="activeTab"
        :isShowIncome="totals.income !== 0"
        :isShowExpense="totals.expense !== 0"
        @click="id => activeTab = id"
      />
    </div>

    <div class="">
      <WalletsList
        v-slot="{ walletsItemsLimited }"
        :limit="4"
        class="flex gap-1 overflow-hidden overflow-x-auto p-2 pb-0"
      >
        <WalletsItem
          v-for="(wallet, walletId) in walletsItemsLimited"
          :key="walletId"
          :activeItemId="filteredWallets.includes(`${walletId}`) ? walletId : null"
          :walletId
          :wallet
          alt
          insideClasses="bg-item-4 min-w-16"
          @click="filteredWallets.includes(`${walletId}`) ? filteredWallets = filteredWallets.filter(id => id !== `${walletId}`) : filteredWallets.push(`${walletId}`)"
        />
      </WalletsList>
    </div>
  </div>

  <!-- NetIncome -->
  <StatMiniItem
    v-if="activeTab === 'netIncome' && totals.sum && (totals.expense !== 0 || totals.income !== 0)"
    :storageKey="props.storageKey + activeTab"
    :trnsIds="trnsIds"
    class="-max-w-2xl max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
    type="sum"
  />

  <!-- Expense -->
  <StatMiniItem
    v-if="(activeTab === 'expense') && expenseTrnsIds.length > 0"
    :trnsIds="expenseTrnsIds"
    :storageKey="props.storageKey + activeTab"
    class="-max-w-2xl max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
    type="expense"
  />

  <!-- Income -->
  <StatMiniItem
    v-if="(activeTab === 'income') && incomeTrnsIds.length > 0"
    :trnsIds="incomeTrnsIds"
    :storageKey="props.storageKey + activeTab"
    class="-max-w-2xl max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
    type="income"
  />

  <!-- Summary -->
  <div
    v-if="activeTab === 'sum'"
    class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
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
</template>
