<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesBreakdown } from '~/components/stat/categories/useCategoriesBreakdown'

const props = defineProps<{
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
  storageKey: string
  type: SeriesSlugSelected | StatTabSlug
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  setCategoryFilter: [categoryId: CategoryId]
}>()

const { categoriesWithData, groupedCategories, ungroupedCategories } = useCategoriesBreakdown(props)
</script>

<template>
  <div
    v-if="categoriesWithData.length > 0"
    class="grid content-start gap-3 @3xl/main:max-w-lg"
  >
    <StatCategoriesVerticalSection
      :groupedCategories
      :isOneCategory="props.isOneCategory"
      :storageKey="props.storageKey"
      :type="props.type"
      :ungroupedCategories
      @clickCategory="emit('clickCategory', $event)"
    />

    <StatCategoriesListSection
      :categoriesWithData
      :groupedCategories
      :isOneCategory="props.isOneCategory"
      :storageKey="props.storageKey"
      :type="props.type"
      :ungroupedCategories
      @clickCategory="emit('clickCategory', $event)"
    />
  </div>
</template>
