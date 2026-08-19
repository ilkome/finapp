<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesBreakdown } from '~/components/stat/categories/useCategoriesBreakdown'

const props = defineProps<{
  baseCategoryViews?: CategoryViews
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  focusedCategoryId?: CategoryId
  focusedChildCategoryId?: CategoryId
  isOneCategory?: boolean
  isTwoColumnLayout?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
  storageKey: string
  type: SeriesSlugSelected | 'summary'
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  openCategory: [categoryId: CategoryId]
  setCategoryFilter: [categoryId: CategoryId]
  setChildCategoryFilter: [categoryId: CategoryId]
}>()

const { categoriesWithData, focusedCategories, groupedCategories, ungroupedCategories } = useCategoriesBreakdown(props)
const isFocused = computed(() => !!props.focusedCategoryId)
const displayedCategories = computed(() => isFocused.value ? focusedCategories.value : categoriesWithData.value)
</script>

<template>
  <div
    v-if="displayedCategories.length > 0"
    class="grid content-start gap-3 @3xl/main:max-w-lg"
  >
    <StatCategoriesVerticalSection
      v-if="!isFocused"
      :groupedCategories
      :isOneCategory="props.isOneCategory"
      :isTwoColumnLayout="props.isTwoColumnLayout"
      :storageKey="props.storageKey"
      :type="props.type"
      :ungroupedCategories
      @clickCategory="emit('clickCategory', $event)"
    />

    <StatCategoriesListSection
      :categoriesWithData
      :focusedChildCategoryId="props.focusedChildCategoryId"
      :focusedCategories="isFocused ? focusedCategories : undefined"
      :groupedCategories
      :isOneCategory="props.isOneCategory"
      :storageKey="props.storageKey"
      :type="props.type"
      :ungroupedCategories
      @openCategory="emit('openCategory', $event)"
      @setFocusedCategoryFilter="emit('setChildCategoryFilter', $event)"
    />
  </div>
</template>
