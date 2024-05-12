<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { CategoryId } from '~/components/categories/types'
import useAmount from '~/components/amount/useAmount'

const props = defineProps<{
  categoryId: CategoryId
}>()

const trnsStore = useTrnsStore()
const currenciesStore = useCurrenciesStore()
const { getTotalOfTrnsIds } = useAmount()

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: [props.categoryId],
}, {
  includesChildCategories: true,
}))

const allTotal = computed(() => getTotalOfTrnsIds(trnsIds.value))
</script>

<template>
  <div>
    <div>Mini</div>
    <pre>{{ props }}</pre>

    <div class="grid grid-cols-2 gap-24">
      <StatMiniItem
        v-if="allTotal.expense"
        :trnsIds="trnsIds.filter(trnId => trnsStore.items[trnId].type === 0)"
        type="expense"
      />

      <StatMiniItem
        v-if="allTotal.income"
        :trnsIds="trnsIds.filter(trnId => trnsStore.items[trnId].type === 1)"
        type="income"
      />
    </div>
  </div>
</template>
