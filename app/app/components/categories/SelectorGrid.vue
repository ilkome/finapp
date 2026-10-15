<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId } from '~/components/categories/types'
import type { RowBackgroundType } from '~/components/ui/RowBackground.vue'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  backgroundType?: RowBackgroundType
  getContextMenuItems?: (categoryId: CategoryId) => ContextMenuItem[][] | undefined
  getTo?: (categoryId: CategoryId) => string
  ids: CategoryId[]
  isRoundIcon?: boolean
  isTwoColumns?: boolean
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
    to: props.getTo?.(categoryId),
  }
}))
</script>

<template>
  <CategoriesSelectorGridView
    :activeItemId="props.activeItemId"
    :backgroundType="props.backgroundType"
    :isRoundIcon="props.isRoundIcon"
    :isTwoColumns="props.isTwoColumns"
    :isShowNew="!!props.onNew"
    :items
    :selectedIds="props.selectedIds"
    @new="props.onNew?.()"
    @selected="emit('selected', $event)"
  />
</template>
