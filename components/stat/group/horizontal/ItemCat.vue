<script setup lang="ts">
// TODO: setup
import type { CategoryId } from '~/components/categories/types'
import { getTotal } from '~/components/amount/getTotal'
import type { TrnType } from '~/components/trns/types'

const props = defineProps<{
  type: TrnType
  categoryId: CategoryId
}>()

const { $store } = useNuxtApp()
const typeName = computed(() => props.type === 1 ? 'income' : 'expense')

const statCategories = computed(() => {
  return $store.getters['categories/getChildCategoriesIds'](props.categoryId)
    .reduce((acc, id) => {
      const trnsIds = getTrnsByCategoryId(id)
      if (trnsIds.length > 0)
        acc.push(getCategoryStat({ categoryId: id, trnsIds }))
      return acc
    }, [])
    .sort((a, b) => b[typeName.value] - a[typeName.value])
})

function getTrnsByCategoryId(categoryId) {
  const trnsItems = $store.state.trns.items
  // Note: same performance as in one filter but better readability
  return $store.getters['trns/selectedTrnsIdsWithDate']
    .filter(id => trnsItems[id].categoryId === categoryId)
    .filter(id => trnsItems[id].type === props.type)
}

function getCategoryStat({ categoryId, trnsIds }) {
  const trnsItems = $store.state.trns.items
  const walletsItems = $store.state.wallets.items
  const baseCurrencyCode = $store.state.currencies.base
  const rates = $store.state.currencies.rates

  const total = getTotal({
    baseCurrencyCode,
    rates,
    trnsIds,
    trnsItems,
    walletsItems,
  })

  return {
    categoryId,
    total: total.sumTransactions,
    income: total.incomeTransactions,
    expense: total.expenseTransactions,
  }
}
</script>

<template lang="pug">
div
  StatGroupHorizontalItemCatItem(
    v-for="category in statCategories"
    :key="category.categoryId"
    :biggest="$store.getters['stat/statCurrentPeriod'][typeName].biggest"
    :category="$store.state.categories.items[category.categoryId]"
    :categoryId="category.categoryId"
    :total="category[typeName]"
    :type="type"
  )
</template>
