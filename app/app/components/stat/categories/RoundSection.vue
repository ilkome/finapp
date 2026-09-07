<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { addEmptyCategoryViews, collectRoundCategoryIds, resolveCategoryGrouping } from '~/components/stat/categories/categoryViews'
import { sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'
import { filterFocusedCategories, projectCategorySelection, resolveFocusedParentId } from '~/components/stat/categories/focusedCategories'
import { statConfigKey } from '~/components/stat/injectionKeys'

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
const statConfig = inject(statConfigKey)!

const grouping = computed(() => statConfig.config.value.categories.round.grouping)
const isShowFavorites = computed(() => statConfig.config.value.categories.round.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.categories.round.isShowRecent)

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
  if (props.focusedCategoryId || !statConfig.config.value.categories.round.isHideOthersOnSelect || filteredSet.value.size === 0)
    return roundCategories.value

  return roundCategories.value.filter(item => filteredSet.value.has(item.id))
})

// Unique per section: the same category can sit in several clouds at once (one per period in
// the feed, plus the focus row), and duplicate transition names abort the whole transition.
const transitionScope = useId()
function transitionName(categoryId: CategoryId) {
  return `statCat-${transitionScope}-${categoryId}`.replace(/[^\w-]/g, '_')
}

function onSetCategoryFilter(categoryId: CategoryId) {
  const nextId = selectedIdByVisibleId.value.get(categoryId) ?? categoryId
  runViewTransition(() => emit('setCategoryFilter', nextId))
}
</script>

<template>
  <div class="flex min-w-0 flex-wrap justify-start gap-1 gap-y-2">
    <slot name="prepend" />

    <StatCategoriesRound
      v-for="item in visibleRoundCategories"
      :key="item.id"
      :item="item"
      :style="{ viewTransitionName: transitionName(item.id) }"
      :class="{
        'opacity-60': filteredSet.size > 0 && !filteredSet.has(item.id),
        'opacity-50': !filteredSet.has(item.id) && item.value === 0,
        'border-primary/40!': filteredSet.has(item.id),
      }"
      class="transition-opacity"
      isShowAmount
      :isShowParent="false"
      @click="onSetCategoryFilter(item.id)"
    />
  </div>
</template>
