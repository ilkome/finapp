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

const isChildrenGrid = computed(() => props.childrenView === 'grid')
const isShowBackground = computed(() => !!props.backgroundType && props.backgroundType !== 'none')

// The row and its children collapsible are siblings, so the spacing lives on the row
// itself: a container gap would also apply to the collapsible and double up.
const backgroundClasses = computed(() => ({
  'bg-elevated/10 hover:bg-elevated/30': props.backgroundType === 'category',
  'bg-elevated/30 hover:bg-elevated/50': props.backgroundType === 'standard',
  'relative mb-1 overflow-hidden rounded-md': isShowBackground.value,
}))

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
      <div :class="backgroundClasses">
        <div
          v-if="props.backgroundType === 'category'"
          :style="{ backgroundColor: categoriesStore.items[categoryId]?.color }"
          class="pointer-events-none absolute inset-0 opacity-5"
        />
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
          :lineWidth="isShowBackground ? 0 : (props.categoriesItemProps?.lineWidth ?? 1)"
          class="group relative"
          :class="props.expanded?.isExpanded(categoryId) ? '[&_.uiElementLine]:bg-transparent' : undefined"
          @click="emit('click', categoryId)"
          @toggle="props.expanded?.toggle(categoryId)"
        />
      </div>

      <UCollapsible
        v-if="categoriesStore.hasChildren(categoryId)"
        :open="props.expanded?.isExpanded(categoryId)"
        :ui="{ content: 'overflow-hidden' }"
      >
        <template #content>
          <div
            :class="[
              isChildrenGrid ? 'ml-2 pr-2 pb-4 pl-3' : 'ml-5 pl-3',
              !isChildrenGrid && !isShowBackground && 'pb-1',
            ]"
          >
            <template v-if="!isChildrenGrid">
              <div
                v-for="childId in getChildrenIds(categoryId)"
                :key="childId"
                :class="backgroundClasses"
              >
                <div
                  v-if="props.backgroundType === 'category'"
                  :style="{ backgroundColor: categoriesStore.items[childId]?.color }"
                  class="pointer-events-none absolute inset-0 opacity-5"
                />
                <CategoriesItem
                  :activeItemId="activeItemId"
                  :category="categoriesStore.items[childId]!"
                  :categoryId="childId"
                  :contextMenuItems="props.getContextMenuItems?.(childId)"
                  :insideClasses="props.insideClasses"
                  :to="props.getTo?.(childId)"
                  v-bind="categoriesItemProps"
                  :lineWidth="isShowBackground ? 0 : (props.categoriesItemProps?.lineWidth ?? 1)"
                  class="group relative"
                  @click="emit('click', childId)"
                />
              </div>
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
      </UCollapsible>
    </template>
  </div>
</template>
