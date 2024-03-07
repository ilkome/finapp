<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  typeText: MoneyTypeSlug
}>()

const { statPage } = useStatPage()
const { ui } = useUIView()
const { statCurrentPeriod } = useStat()
const categoriesStore = useCategoriesStore()

const biggestAmount = computed(
  () => statCurrentPeriod.value[props.typeText].biggest,
)

const isShow = computed(
  () =>
    ui.showCatsVerticalChart
    && statPage.current[props.typeText]?.categoriesIds?.length > 1,
)
</script>

<template>
  <div v-if="isShow" class="overflow-hidden rounded-lg bg-item-4 px-2 pb-2 pt-2">
    <div
      v-if="statCurrentPeriod[typeText].categoriesIds.length > 0"
      class="scrollbar flex overflow-x-auto px-2 pb-2"
    >
      <StatGroupVerticalItem
        v-for="categoryId in statCurrentPeriod[typeText].categoriesIds"
        :key="`charts-${categoryId}`"
        :biggest="biggestAmount"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :total="statCurrentPeriod.categories[categoryId][typeText]"
      />
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.scrollbar
  scrollbar()
</style>
