<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const { statCurrentPeriod, moneyTypes } = useStat()
const { ui } = useUIView()
const categoriesStore = useCategoriesStore()

const isShow = computed(
  () =>
    statCurrentPeriod.value[props.moneyTypeSlug]?.categoriesIds?.length
    && ui.value.showCatsHorizontalList,
)

const moneyTypeNumber = moneyTypes.find(t => t.id === props.moneyTypeSlug)?.type ?? 1
</script>

<template>
  <div v-if="isShow" class="grid gap-2">
    <div class="flex flex-col gap-1">
      <StatGroupHorizontalItem
        v-for="categoryId in statCurrentPeriod[moneyTypeSlug].categoriesIds"
        :key="categoryId"
        :biggest="statCurrentPeriod[moneyTypeSlug].biggest"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :total="statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
        :moneyTypeNumber="moneyTypeNumber"
        :moneyTypeSlug="moneyTypeSlug"
      />
    </div>
  </div>
</template>
