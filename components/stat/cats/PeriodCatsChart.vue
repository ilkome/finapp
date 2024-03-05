<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  type: MoneyTypeSlug
}>()

const { statCurrentPeriod } = useStat()
const categoriesStore = useCategoriesStore()

const biggestAmount = computed(
  () => statCurrentPeriod.value[props.type].biggest,
)
</script>

<template>
  <div
    v-if="statCurrentPeriod[type].categoriesIds.length > 0"
    class="flex overflow-hidden overflow-x-auto px-2 pb-2"
  >
    <StatCatsPeriodCatsChartItem
      v-for="categoryId in statCurrentPeriod[type].categoriesIds"
      :key="`charts-${categoryId}`"
      :biggest="biggestAmount"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :total="statCurrentPeriod.categories[categoryId][type]"
    />
  </div>
</template>
