<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { addEmptyCategoryViews, collectRoundCategoryIds, resolveCategoryGrouping } from '~/components/stat/categories/categoryViews'
import { sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'
import { filterFocusedCategories, projectCategorySelection, resolveFocusedParentId } from '~/components/stat/categories/focusedCategories'
import { useStatCategoryRows } from '~/components/stat/categories/useStatCategoryRows'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const props = defineProps<{
  baseCategoryViews: CategoryViews
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  filteredCategoriesIds: CategoryId[]
  focusedCategoryId?: CategoryId
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  setCategoryFilter: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const statConfig = useStatConfigCtx()

const grouping = computed(() => statConfig.categories.value.round.grouping)
const isShowFavorites = computed(() => statConfig.categories.value.round.isShowFavorites)
const isShowRecent = computed(() => statConfig.categories.value.round.isShowRecent)

const mergedPreCategoriesIds = computed(() => collectRoundCategoryIds({
  favoriteCategoryIds: categoriesStore.favoriteCategoriesIds,
  filteredCategoryIds: props.filteredCategoriesIds,
  isShowFavorites: isShowFavorites.value,
  isShowRecent: isShowRecent.value,
  preCategoryIds: props.preCategoriesIds,
  recentCategoryIds: categoriesStore.recentCategoriesIds,
}))

// Adds zero-value placeholders for favorites, recents and the current selection, so a selected
// category keeps a chip in periods where it has no transactions.
const expandedViews = computed(() => addEmptyCategoryViews(
  props.baseCategoryViews,
  categoriesStore.items,
  mergedPreCategoriesIds.value,
  props.excludedCategoriesIds,
))

// Categories laid out by the current grouping for the selected period; a selected
// child may be collapsed into its parent group here.
const groupedCategories = computed(() => {
  if (props.focusedCategoryId) {
    return filterFocusedCategories(
      props.baseCategoryViews.ungrouped,
      categoriesStore.getChildrenIds(props.focusedCategoryId),
    )
  }

  if (props.isOneCategory)
    return props.baseCategoryViews.ungrouped

  // The selection counts towards its group even with no transactions in this period, so the
  // cloud keeps showing the parent instead of splitting out a lone sibling.
  return resolveCategoryGrouping(
    expandedViews.value,
    grouping.value,
    expandedViews.value.ungrouped,
    new Set(props.filteredCategoriesIds),
  )
})

// Children of the focused parent are listed in the focus row below, so a child grouping must
// not repeat them as standalone chips next to their parent.
const hiddenChildrenIds = computed(() => {
  const visibleIds = new Set(groupedCategories.value.map(category => category.id))
  const parentId = resolveFocusedParentId(
    props.filteredCategoriesIds[0],
    categoryId => getParentCategoryIdOrUndefined(categoriesStore.items, categoryId),
  )
  return parentId && visibleIds.has(parentId)
    ? new Set(categoriesStore.getChildrenIds(parentId))
    : new Set<CategoryId>()
})

const roundCategories = computed(() => {
  if (props.focusedCategoryId || props.isOneCategory)
    return groupedCategories.value

  // A parent has no leaf of its own, so in child grouping its placeholder would read 0. The
  // group row carries the children's total, which is what the parent chip has to show.
  const groupById = new Map(expandedViews.value.grouped.map(group => [group.id, group]))
  return groupedCategories.value
    .filter(item => !hiddenChildrenIds.value.has(item.id))
    .map(item => item.trnsIds.length === 0 ? groupById.get(item.id) ?? item : item)
    .sort(sortCategoriesByAmount)
})

// Project over the grouped view: a collapsed selected child highlights its parent chip.
const selectedIdByVisibleId = computed(() => projectCategorySelection({
  activeCategories: props.baseCategoryViews.ungrouped,
  getChildrenIds: categoryId => categoriesStore.getChildrenIds(categoryId),
  getParentId: categoryId => getParentCategoryIdOrUndefined(categoriesStore.items, categoryId),
  selectedIds: props.filteredCategoriesIds,
  visibleCategories: groupedCategories.value,
}))
const filteredSet = computed(() => new Set(selectedIdByVisibleId.value.keys()))
const visibleRoundCategories = computed(() => {
  if (props.focusedCategoryId || !statConfig.categories.value.round.isHideOthersOnSelect || filteredSet.value.size === 0)
    return roundCategories.value

  return roundCategories.value.filter(item => filteredSet.value.has(item.id))
})

const { currencyCode, openFormForCategory, rows } = useStatCategoryRows(visibleRoundCategories)
const selectedIds = computed(() => [...filteredSet.value])
// The same category can sit in several clouds at once (one per period in the feed, plus the
// focus row), and duplicate transition names abort the whole transition.
const transitionScope = useId()

function onSetCategoryFilter(categoryId: CategoryId) {
  const nextId = selectedIdByVisibleId.value.get(categoryId) ?? categoryId
  runViewTransition(() => emit('setCategoryFilter', nextId))
}
</script>

<template>
  <StatCategoriesRoundListView
    :currencyCode
    :isIconBg="statConfig.categories.value.round.isIconBg"
    :isInlineAmount="statConfig.categories.value.round.isInlineAmount"
    :isShowParent="false"
    :rows
    :selectedIds
    :transitionScope
    isShowAmount
    @click="onSetCategoryFilter"
    @longPress="openFormForCategory"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>
  </StatCategoriesRoundListView>
</template>
