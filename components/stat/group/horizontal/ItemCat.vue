<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TrnType } from '~/components/trns/types'
import { getTotal } from '~/components/amount/getTotal'
import { useStat } from '~/components/stat/useStat'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  type: TrnType
  categoryId: CategoryId
}>()

const { statCurrentPeriod } = useStat()
const currenciesStore = useCurrenciesStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const typeName = computed(() => props.type === 1 ? 'income' : 'expense')
const biggestAmount = computed(() => statCurrentPeriod.value[typeName.value].biggest)

const statCategories = computed(() => {
  return categoriesStore.getChildCategoriesIds(props.categoryId)
    .reduce((acc, id) => {
      const trnsIds = getTrnsByCategoryId(id)
      if (trnsIds.length > 0)
        acc.push(getCategoryStat({ categoryId: id, trnsIds }))
      return acc
    }, [])
    .sort((a, b) => b[typeName.value] - a[typeName.value])
})

function getTrnsByCategoryId(categoryId) {
  const trnsItems = trnsStore.items
  // Note: same performance as in one filter but better readability
  return trnsStore.selectedTrnsIdsWithDate
    .filter(id => trnsItems[id].categoryId === categoryId)
    .filter(id => trnsItems[id].type === props.type)
}

function getCategoryStat({ categoryId, trnsIds }) {
  const trnsItems = trnsStore.items
  const walletsItems = walletsStore.items
  const baseCurrencyCode = currenciesStore.base
  const rates = currenciesStore.rates

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
    :biggest="biggestAmount"
    :category="categoriesStore.items[category.categoryId]"
    :categoryId="category.categoryId"
    :total="category[typeName]"
    :type="type"
  )
</template>
