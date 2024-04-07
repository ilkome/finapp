<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

defineProps<{
  categories: any
  moneyTypeSlug: MoneyTypeSlug
  moneyTypeNumber: MoneyTypeNumber
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div
    v-if="categories.length > 0"
    class="overflow-hidden scrollbar flex overflow-x-auto pb-2"
  >
    <StatGroupVerticalItem
      v-for="item in categories"
      :key="item.id"
      :biggest="categories[0].value"
      :category="categoriesStore.items[item.id]"
      :categoryId="item.id"
      :total="item.value"
    />
  </div>
</template>
