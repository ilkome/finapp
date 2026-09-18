<script setup lang="ts">
import type { CategoryItemProps } from '~/components/categories/Item.vue'
import type { CategoryListRow } from '~/components/categories/ListView.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

export type CategoriesListExpanded = {
  isExpanded: (id: CategoryId) => boolean
  toggle: (id: CategoryId) => void
}

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  backgroundType?: 'category' | 'none' | 'standard'
  categoriesItemProps?: Partial<CategoryItemProps>
  childrenView?: 'list' | 'grid'
  expanded?: CategoriesListExpanded
  getContextMenuItems?: (categoryId: CategoryId) => any[][] | undefined
  getTo?: (categoryId: CategoryId) => string
  ids: CategoryId[]
  insideClasses?: string
}>()

const emit = defineEmits<{
  click: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

function toRow(categoryId: CategoryId, withChildren: boolean): CategoryListRow | null {
  const category = categoriesStore.items[categoryId]
  if (!category)
    return null
  return {
    category,
    categoryId,
    children: withChildren
      ? categoriesStore.getChildrenIds(categoryId).map(id => toRow(id, false)).filter(row => row !== null)
      : undefined,
    contextMenuItems: props.getContextMenuItems?.(categoryId),
    parentCategory: categoriesStore.items[category.parentId],
    to: props.getTo?.(categoryId),
  }
}

const rows = computed(() => props.ids.map(id => toRow(id, true)).filter(row => row !== null))
const expandedIds = computed(() => props.expanded ? props.ids.filter(id => props.expanded!.isExpanded(id)) : [])
</script>

<template>
  <CategoriesListView
    :activeItemId="props.activeItemId"
    :backgroundType="props.backgroundType"
    :categoriesItemProps="props.categoriesItemProps"
    :childrenView="props.childrenView"
    :expandedIds="expandedIds"
    :insideClasses="props.insideClasses"
    :isExpandable="!!props.expanded"
    :rows="rows"
    @click="emit('click', $event)"
    @toggleExpand="props.expanded?.toggle($event)"
  />
</template>
