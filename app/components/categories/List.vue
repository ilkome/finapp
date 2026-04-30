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

const isChildrenGrid = computed(() => props.childrenView === 'grid')

function getRootLineWidth(categoryId: CategoryId) {
  if (props.expanded?.isExpanded(categoryId) && categoriesStore.hasChildren(categoryId))
    return 0
  return props.categoriesItemProps?.lineWidth ?? 1
}

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
        v-bind="categoriesItemProps"
        class="group"
        :lineWidth="getRootLineWidth(categoryId)"
        @click="emit('click', categoryId)"
        @toggle="props.expanded?.toggle(categoryId)"
      />

      <div
        v-if="props.expanded?.isExpanded(categoryId) && categoriesStore.hasChildren(categoryId)"
        :class="isChildrenGrid
          ? 'ml-2 pb-4 pl-3 pr-2'
          : '-mt-px ml-5 pb-1 pl-3'"
      >
        <template v-if="!isChildrenGrid">
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
            class="group"
            @click="emit('click', childId)"
          />
        </template>

        <div v-else class="flex flex-wrap gap-1">
          <CategoriesRoundLink
            v-for="childId in getChildrenIds(categoryId)"
            :key="childId"
            :categoryId="childId"
            :contextMenuItems="props.getContextMenuItems?.(childId)"
            :to="props.getTo?.(childId)"
            @click="emit('click', childId)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
