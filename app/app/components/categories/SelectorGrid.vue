<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  getContextMenuItems?: (categoryId: CategoryId) => ContextMenuItem[][] | undefined
  ids: CategoryId[]
  onNew?: () => void
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

const items = computed(() => props.ids.map((categoryId) => {
  const category = categoriesStore.items[categoryId]!
  return {
    category,
    categoryId,
    childrenCount: categoriesStore.getChildrenIds(categoryId).length,
    contextMenuItems: props.getContextMenuItems?.(categoryId),
    parentCategory: categoriesStore.items[category?.parentId],
  }
}))
</script>

<template>
  <CategoriesSelectorGridView
    :activeItemId="props.activeItemId"
    :isShowNew="!!props.onNew"
    :items
    :selectedIds="props.selectedIds"
    @new="props.onNew?.()"
    @selected="emit('selected', $event)"
  />
</template>
