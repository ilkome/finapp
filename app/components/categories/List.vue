<script setup lang="ts">
import type { CategoryItemProps } from '~/components/categories/Item.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

export type CategoriesListExpanded = {
  isExpanded: (id: CategoryId) => boolean
  toggle: (id: CategoryId) => void
}

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  categoriesItemProps?: Partial<CategoryItemProps>
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

function getChildrenIds(categoryId: CategoryId) {
  return categoriesStore.getChildrenIds(categoryId)
}
</script>

<template>
  <div class="pt-1">
    <template
      v-for="categoryId in ids"
      :key="categoryId"
    >
      <CategoriesItem
        :activeItemId="activeItemId"
        :category="categoriesStore.items[categoryId]!"
        :categoryId="categoryId"
        :contextMenuItems="props.getContextMenuItems?.(categoryId)"
        :insideClasses="props.insideClasses"
        :isExpanded="props.expanded?.isExpanded(categoryId)"
        :isShowChevron="!!props.expanded && categoriesStore.hasChildren(categoryId)"
        :to="props.getTo?.(categoryId)"
        :lineWidth="1"
        v-bind="categoriesItemProps"
        @click="emit('click', categoryId)"
        @toggle="props.expanded?.toggle(categoryId)"
      />

      <div
        v-if="props.expanded?.isExpanded(categoryId) && categoriesStore.hasChildren(categoryId)"
        class="-mt-px ml-5 pb-1 pl-3"
      >
        <CategoriesItem
          v-for="childId in getChildrenIds(categoryId)"
          :key="childId"
          :activeItemId="activeItemId"
          :category="categoriesStore.items[childId]!"
          :categoryId="childId"
          :contextMenuItems="props.getContextMenuItems?.(childId)"
          :insideClasses="props.insideClasses"
          :to="props.getTo?.(childId)"
          :lineWidth="1"
          v-bind="categoriesItemProps"
          @click="emit('click', childId)"
        />
      </div>
    </template>
  </div>
</template>
