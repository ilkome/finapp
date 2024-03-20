<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStatStore'

defineProps<{
  categoriesIds: CategoryId[]
  biggest: number
  moneyTypeSlug: MoneyTypeSlug
  moneyTypeNumber: MoneyTypeNumber
}>()

const statStore = useStat()
const categoriesStore = useCategoriesStore()
</script>

<template>
  <div
    v-if="categoriesIds.length > 0"
    class="overflow-hidden rounded-lg bg-item-4 px-2 pb-2 pt-2"
  >
    <div class="scrollbar flex overflow-x-auto px-2 pb-2">
      <StatGroupVerticalItem
        v-for="categoryId in categoriesIds"
        :key="categoryId"
        :biggest
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :total="statStore.statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
      />
    </div>
  </div>
</template>
