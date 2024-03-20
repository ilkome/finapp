<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStatStore'

const props = defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const { ui } = useUIView()
const statStore = useStat()
const categoriesStore = useCategoriesStore()

const biggestAmount = computed(
  () => statStore.statCurrentPeriod[props.moneyTypeSlug].biggest,
)

const isShow = computed(
  () =>
    ui.value.showCatsVerticalChart
    && statStore.statCurrentPeriod[props.moneyTypeSlug]?.categoriesIds?.length > 1,
)
</script>

<template>
  <div v-if="isShow" class="overflow-hidden rounded-lg bg-item-4 px-2 pb-2 pt-2">
    <div
      v-if="statStore.statCurrentPeriod[moneyTypeSlug].categoriesIds.length > 0"
      class="scrollbar flex overflow-x-auto px-2 pb-2"
    >
      <StatGroupVerticalItem
        v-for="categoryId in statStore.statCurrentPeriod[moneyTypeSlug].categoriesIds"
        :key="`charts-${categoryId}`"
        :biggest="biggestAmount"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :total="statStore.statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
      />
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.scrollbar
  scrollbar()
</style>
