<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'

defineProps<{
  categoriesTotal: any
  categoriesIds: CategoryId[]
  biggest: number
  moneyTypeSlug: MoneyTypeSlug
  moneyTypeNumber: MoneyTypeNumber
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div v-if="categoriesIds.length > 0" class="grid gap-1">
    <StatHorizontalItem
      v-for="categoryId in categoriesIds"
      :key="categoryId"
      :biggest
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :total="categoriesTotal[moneyTypeSlug][categoryId]"
      :moneyTypeNumber="moneyTypeNumber"
      :moneyTypeSlug="moneyTypeSlug"
    />
  </div>
</template>
