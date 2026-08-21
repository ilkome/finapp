<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { addEmptyCategoryViews } from '~/components/stat/categories/categoryViews'
import { filterFocusedCategories } from '~/components/stat/categories/focusedCategories'
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

const isGrouped = computed(() => statConfig.config.value.categories.round.isGrouped)
const isShowFavorites = computed(() => statConfig.config.value.categories.round.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.categories.round.isShowRecent)

const mergedPreCategoriesIds = computed(() => {
  const ids: CategoryId[] = []
  const seen = new Set<CategoryId>()

  function addId(id: CategoryId) {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  if (props.preCategoriesIds) {
    for (const id of props.preCategoriesIds)
      addId(id)
  }

  if (isShowFavorites.value) {
    for (const id of categoriesStore.favoriteCategoriesIds)
      addId(id)
  }

  if (isShowRecent.value) {
    for (const id of categoriesStore.recentCategoriesIds)
      addId(id)
  }

  for (const id of props.filteredCategoriesIds)
    addId(id)

  return ids
})

const roundCategories = computed(() => {
  if (props.focusedCategoryId) {
    return filterFocusedCategories(
      props.baseCategoryViews.ungrouped,
      categoriesStore.getChildrenIds(props.focusedCategoryId),
    )
  }

  if (props.isOneCategory)
    return props.baseCategoryViews.ungrouped

  const views = addEmptyCategoryViews(
    props.baseCategoryViews,
    categoriesStore.items,
    mergedPreCategoriesIds.value,
    props.excludedCategoriesIds,
  )
  return isGrouped.value ? views.grouped : views.ungrouped
})
const filteredSet = computed(() => new Set(props.filteredCategoriesIds))
</script>

<template>
  <div class="flex min-w-0 flex-wrap justify-start gap-1 gap-y-2">
    <StatCategoriesRound
      v-for="item in roundCategories"
      :key="item.id"
      :item="item"
      :class="{
        'opacity-60': filteredSet.size > 0 && !filteredSet.has(item.id),
        'opacity-50': !filteredSet.has(item.id) && item.value === 0,
        'border-primary!': filteredSet.has(item.id),
      }"
      class="transition-opacity"
      isShowAmount
      :isShowParent="false"
      @click="emit('setCategoryFilter', item.id)"
    />
  </div>
</template>
