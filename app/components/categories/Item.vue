<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export type CategoryItemProps = {
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  class?: string
  contextMenuItems?: ContextMenuItem[][]
  insideClasses?: string
  isShowParent?: boolean
  lineWidth?: number
  stacked?: boolean
  to?: string
}

const props = defineProps<CategoryItemProps>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
}>()
</script>

<template>
  <UContextMenu v-if="props.contextMenuItems" :items="props.contextMenuItems">
    <CategoriesItemBody
      :activeItemId="props.activeItemId"
      :stacked="props.stacked"
      :category="props.category"
      :categoryId="props.categoryId"
      :class="props.class"
      :insideClasses="props.insideClasses"
      :isShowParent="props.isShowParent"
      :lineWidth="props.lineWidth"
      :to="props.to"
      @click="emit('click', $event)"
      @filter="emit('filter', $event)"
    />
  </UContextMenu>

  <CategoriesItemBody
    v-else
    :activeItemId="props.activeItemId"
    :stacked="props.stacked"
    :category="props.category"
    :categoryId="props.categoryId"
    :class="props.class"
    :insideClasses="props.insideClasses"
    :isShowParent="props.isShowParent"
    :lineWidth="props.lineWidth"
    :to="props.to"
    @click="emit('click', $event)"
    @filter="emit('filter', $event)"
  />
</template>
