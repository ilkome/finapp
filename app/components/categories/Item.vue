<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export type CategoryItemProps = {
  activeItemId?: string | 0 | false | null
  alt?: boolean
  category: CategoryItem
  categoryId: CategoryId
  class?: string
  contextMenuItems?: any[][]
  insideClasses?: string
  isShowParent?: boolean
  lineWidth?: number
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
      :alt="props.alt"
      :category="props.category"
      :categoryId="props.categoryId"
      :class="props.class"
      :insideClasses="props.insideClasses"
      :isShowParent="props.isShowParent"
      :lineWidth="props.lineWidth"
      @click="emit('click', $event)"
      @filter="emit('filter', $event)"
    />
  </UContextMenu>

  <CategoriesItemBody
    v-else
    :activeItemId="props.activeItemId"
    :alt="props.alt"
    :category="props.category"
    :categoryId="props.categoryId"
    :class="props.class"
    :insideClasses="props.insideClasses"
    :isShowParent="props.isShowParent"
    :lineWidth="props.lineWidth"
    @click="emit('click', $event)"
    @filter="emit('filter', $event)"
  />
</template>
