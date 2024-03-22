<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'

defineProps<{
  categories: any
  moneyTypeSlug: MoneyTypeSlug
  moneyTypeNumber: MoneyTypeNumber
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div v-if="categories.length > 0" class="grid gap-1">
    <StatHorizontalItem
      v-for="item in categories"
      :key="item.id"
      :biggest="categories[0].value"
      :category="categoriesStore.items[item.id]"
      :categoryId="item.id"
      :total="item.value"
      :moneyTypeNumber="moneyTypeNumber"
      :moneyTypeSlug="moneyTypeSlug"
    />
  </div>
</template>
