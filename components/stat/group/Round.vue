<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

defineProps<{
  categories: any
  moneyTypeNumber: MoneyTypeNumber
  moneyTypeSlug: MoneyTypeSlug
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    v-if="categories.length > 0"
    class="flex flex-wrap" :_data-type-text="`${moneyTypeSlug}`"
  >
    <LazyStatGroupRoundItem
      v-for="item in categories"
      :key="item.id"
      :category="categoriesStore.items[item.id]"
      :categoryId="item.id"
      :currencyCode="currenciesStore.base"
      :total="item.value"
      :moneyTypeNumber="moneyTypeNumber"
    />
  </div>
</template>
