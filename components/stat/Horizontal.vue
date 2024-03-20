<script setup lang="ts">
import { moneyTypes } from '~/components/stat/types'
import type { MoneyTypeSlug } from '~/components/stat/types'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStatStore'
import type { CategoryId } from '~/components/categories/types'

const props = defineProps<{
  categoriesIds: CategoryId[]
  biggest: number
  moneyTypeSlug: MoneyTypeSlug
}>()

const statStore = useStat()
const categoriesStore = useCategoriesStore()

const moneyTypeNumber = moneyTypes.find(t => t.id === props.moneyTypeSlug)?.type ?? 1
</script>

<template>
  <div v-if="categoriesIds.length > 0" class="grid gap-1">
    <StatHorizontalItem
      v-for="categoryId in categoriesIds"
      :key="categoryId"
      :biggest
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :total="statStore.statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
      :moneyTypeNumber="moneyTypeNumber"
      :moneyTypeSlug="moneyTypeSlug"
    />
  </div>
</template>
