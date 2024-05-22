<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoryId?: CategoryId
  walletId?: WalletId
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoryId ? [props.categoryId] : [],
  walletsIds: props.walletId ? [props.walletId] : [],
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
  <div class="grid gap-12">
    <div class="grid grid-cols-2 gap-24">
      <!-- Sum -->
      <StatMiniItem
        v-if="totals.sum && (totals.expense !== 0 && totals.income !== 0)"
        :trnsIds="trnsIds"
        type="sum"
      />
    </div>

    <div class="grid grid-cols-2 gap-24">
      <!-- Expense -->
      <StatMiniItem
        v-if="totals.expense"
        :trnsIds="expenseTrnsIds"
        type="expense"
      />

      <!-- Income -->
      <StatMiniItem
        v-if="totals.income"
        :trnsIds="incomeTrnsIds"
        type="income"
      />

      <TrnsList
        v-if="!totals.income && !totals.expense"
        isShowHeader
        :trnsIds
      />
    </div>
  </div>
</template>
