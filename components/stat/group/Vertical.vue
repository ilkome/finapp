<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const { ui } = useUIView()
const { statCurrentPeriod } = useStat()
const categoriesStore = useCategoriesStore()

const biggestAmount = computed(
  () => statCurrentPeriod.value[props.moneyTypeSlug].biggest,
)

const isShow = computed(
  () =>
    ui.value.showCatsVerticalChart
    && statCurrentPeriod.value[props.moneyTypeSlug]?.categoriesIds?.length > 1,
)
</script>

<template>
  <div v-if="isShow" class="overflow-hidden rounded-lg bg-item-4 px-2 pb-2 pt-2">
    <div
      v-if="statCurrentPeriod[moneyTypeSlug].categoriesIds.length > 0"
      class="scrollbar flex overflow-x-auto px-2 pb-2"
    >
      <StatGroupVerticalItem
        v-for="categoryId in statCurrentPeriod[moneyTypeSlug].categoriesIds"
        :key="`charts-${categoryId}`"
        :biggest="biggestAmount"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :total="statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
      />
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.scrollbar
  scrollbar()
</style>
