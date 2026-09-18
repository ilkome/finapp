<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryItemProps } from '~/components/categories/Item.vue'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export type CategoryListRow = {
  category: CategoryItem
  categoryId: CategoryId
  children?: CategoryListRow[]
  contextMenuItems?: ContextMenuItem[][]
  parentCategory?: CategoryItem
  to?: string
}

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  backgroundType?: 'category' | 'none' | 'standard'
  categoriesItemProps?: Partial<CategoryItemProps>
  childrenView?: 'list' | 'grid'
  expandedIds?: CategoryId[]
  insideClasses?: string
  /** Parents are collapsible only when the container tracks expansion. */
  isExpandable?: boolean
  rows: CategoryListRow[]
}>()

const emit = defineEmits<{
  click: [id: CategoryId]
  toggleExpand: [id: CategoryId]
}>()

const isChildrenGrid = computed(() => props.childrenView === 'grid')
const isShowBackground = computed(() => !!props.backgroundType && props.backgroundType !== 'none')
const expanded = computed(() => new Set(props.expandedIds ?? []))
const lineWidth = computed(() => isShowBackground.value ? 0 : (props.categoriesItemProps?.lineWidth ?? 1))

function isRowExpanded(row: CategoryListRow) {
  return !!row.children?.length && expanded.value.has(row.categoryId)
}
</script>

<template>
  <div class="pt-1">
    <template
      v-for="row in rows"
      :key="row.categoryId"
    >
      <UiRowBackground
        :color="row.category.color"
        :type="props.backgroundType"
        :class="isShowBackground && 'mb-1'"
      >
        <CategoriesItemView
          :activeItemId="activeItemId"
          :category="row.category"
          :categoryId="row.categoryId"
          :childrenCount="row.children?.length ?? 0"
          :insideClasses="props.insideClasses"
          :isExpanded="isRowExpanded(row)"
          :isShowChevron="props.isExpandable && !!row.children?.length"
          :contextMenuItems="row.contextMenuItems"
          :parentCategory="row.parentCategory"
          :to="row.to"
          v-bind="categoriesItemProps"
          :lineWidth="lineWidth"
          class="group relative"
          :class="isRowExpanded(row) ? '[&_.uiElementLine]:bg-transparent' : undefined"
          @click="emit('click', row.categoryId)"
          @toggle="emit('toggleExpand', row.categoryId)"
        />
      </UiRowBackground>

      <UCollapsible
        v-if="row.children?.length"
        :open="isRowExpanded(row)"
        :ui="{ content: 'overflow-hidden' }"
      >
        <template #content>
          <div
            :class="[
              isChildrenGrid ? 'pr-2 pb-4 pl-6' : 'pl-6',
              !isChildrenGrid && !isShowBackground && 'pb-1',
            ]"
          >
            <template v-if="!isChildrenGrid">
              <UiRowBackground
                v-for="child in row.children"
                :key="child.categoryId"
                :color="child.category.color"
                :type="props.backgroundType"
                :class="isShowBackground && 'mb-1'"
              >
                <CategoriesItemView
                  :activeItemId="activeItemId"
                  :category="child.category"
                  :categoryId="child.categoryId"
                  :childrenCount="0"
                  :insideClasses="props.insideClasses"
                  :contextMenuItems="child.contextMenuItems"
                  :parentCategory="row.category"
                  :to="child.to"
                  v-bind="categoriesItemProps"
                  :lineWidth="lineWidth"
                  class="group relative"
                  @click="emit('click', child.categoryId)"
                />
              </UiRowBackground>
            </template>

            <div v-else class="flex flex-wrap gap-1">
              <NuxtLink
                v-for="child in row.children"
                :key="child.categoryId"
                :to="child.to"
                class="text-inherit no-underline"
                @click="emit('click', child.categoryId)"
              >
                <CategoriesRoundPillView :category="child.category" :parentCategory="row.category" />
              </NuxtLink>
            </div>
          </div>
        </template>
      </UCollapsible>
    </template>
  </div>
</template>
