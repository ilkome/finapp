<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

export type CategoryItemProps = {
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  class?: string
  contextMenuItems?: ContextMenuItem[][]
  hideLeftMenuButton?: boolean
  insideClasses?: string
  isExpanded?: boolean
  isRoundIcon?: boolean
  isShowChevron?: boolean
  isShowChildrenCount?: boolean
  isShowParent?: boolean
  leftMenuButton?: boolean
  lineWidth?: number
  selectedIds?: CategoryId[]
  stacked?: boolean
  to?: string
}

const props = defineProps<CategoryItemProps>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
  toggle: []
}>()

const categoriesStore = useCategoriesStore()

const childrenCount = computed(() => categoriesStore.getChildrenIds(props.categoryId).length)
const parentCategory = computed(() => categoriesStore.items[props.category?.parentId])
</script>

<template>
  <CategoriesItemView
    v-bind="props"
    :childrenCount="childrenCount"
    :parentCategory="parentCategory"
    @click="emit('click', $event)"
    @filter="emit('filter', $event)"
    @toggle="emit('toggle')"
  />
</template>
