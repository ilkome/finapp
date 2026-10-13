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
  /** A flat pick list (favorites, recent): every row is one size and names its parent. */
  isFlat?: boolean
  /** Parents with children pin under the page header and the block title while their children scroll. */
  isStickyParents?: boolean
  layout?: 'columns' | 'list'
  rows: CategoryListRow[]
}>()

const emit = defineEmits<{
  click: [id: CategoryId]
  toggleExpand: [id: CategoryId]
}>()

// Flat lists and children fill a column top to bottom before starting the next one.
const flowColumnsClass = 'columns-[12rem] gap-x-10 *:mb-1 *:break-inside-avoid'
const gridColumnsClass = 'grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-1 gap-x-10'
const stickyParentClass = 'sticky top-[calc(var(--sticky-top,0px)+2.375rem)] z-9 bg-default'
// Hosts without a background setting (the form sheet) keep the card look of the columns.
const columnsBackground = computed(() => props.backgroundType ?? 'standard')
const isChildrenGrid = computed(() => props.childrenView === 'grid')
// An expanded parent opens its own background around the children; the children sit on it one step lighter.
const nestedBackground = computed(() => columnsBackground.value === 'none' ? 'none' : 'standard')
const isShowBackground = computed(() => !!props.backgroundType && props.backgroundType !== 'none')
const expanded = computed(() => new Set(props.expandedIds ?? []))
const lineWidth = computed(() => isShowBackground.value ? 0 : (props.categoriesItemProps?.lineWidth ?? 1))

function isRowExpanded(row: CategoryListRow) {
  return !!row.children?.length && expanded.value.has(row.categoryId)
}
</script>

<template>
  <div v-if="props.layout === 'columns'" :class="props.isFlat ? flowColumnsClass : gridColumnsClass" class="pt-1.5">
    <div
      v-for="row in rows"
      :key="row.categoryId"
      :class="!props.isFlat && !row.parentCategory && 'col-span-full'"
    >
      <div :class="props.isStickyParents && row.children?.length && stickyParentClass">
        <UiRowBackground
          :color="row.category.color"
          :type="columnsBackground"
          :class="isRowExpanded(row) && columnsBackground !== 'none' && 'rounded-b-none!'"
        >
          <CategoriesItemView
            v-bind="categoriesItemProps"
            :activeItemId="activeItemId"
            :category="row.category"
            :categoryId="row.categoryId"
            :childrenCount="row.children?.length ?? 0"
            :contextMenuItems="row.contextMenuItems"
            :isExpanded="isRowExpanded(row)"
            :isShowChevron="props.isExpandable && !!row.children?.length"
            :isShowParent="props.isFlat"
            :lineWidth="0"
            :parentCategory="row.parentCategory"
            :to="row.to"
            class="group relative block"
            stacked
            @click="emit('click', row.categoryId)"
            @toggle="emit('toggleExpand', row.categoryId)"
          />
        </UiRowBackground>
      </div>

      <UiRowBackground
        v-if="isRowExpanded(row)"
        :color="row.category.color"
        :type="columnsBackground"
        noHover
        :class="columnsBackground === 'none' ? 'pt-1.5 pb-4.5' : 'mb-4.5 rounded-t-none! p-2 pt-1'"
      >
        <slot name="childrenPrepend" :row="row" />

        <div v-if="isChildrenGrid" class="flex flex-wrap gap-1">
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

        <div v-else :class="flowColumnsClass">
          <UiRowBackground
            v-for="child in row.children"
            :key="child.categoryId"
            :color="child.category.color"
            :type="nestedBackground"
          >
            <CategoriesItemView
              v-bind="categoriesItemProps"
              :activeItemId="activeItemId"
              :category="child.category"
              :categoryId="child.categoryId"
              :childrenCount="0"
              :contextMenuItems="child.contextMenuItems"
              :to="child.to"
              :lineWidth="0"
              class="group relative block"
              stacked
              @click="emit('click', child.categoryId)"
            />
          </UiRowBackground>
        </div>
      </UiRowBackground>
    </div>
  </div>

  <div v-else class="pt-1.5">
    <div
      v-for="row in rows"
      :key="row.categoryId"
    >
      <div :class="props.isStickyParents && row.children?.length && stickyParentClass">
        <UiRowBackground
          :color="row.category.color"
          :type="props.backgroundType"
          :class="isShowBackground && (isRowExpanded(row) ? 'rounded-b-none!' : 'mb-1')"
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
            :isShowParent="props.isFlat || categoriesItemProps?.isShowParent"
            :lineWidth="lineWidth"
            class="group relative"
            :class="isRowExpanded(row) ? '[&_.uiElementLine]:bg-transparent' : undefined"
            @click="emit('click', row.categoryId)"
            @toggle="emit('toggleExpand', row.categoryId)"
          />
        </UiRowBackground>
      </div>

      <UCollapsible
        v-if="row.children?.length"
        :open="isRowExpanded(row)"
        :ui="{ content: 'overflow-hidden' }"
      >
        <template #content>
          <UiRowBackground
            :color="row.category.color"
            noHover
            :type="props.backgroundType"
            :class="isShowBackground && 'mb-1 rounded-t-none! p-2 pt-1'"
          >
            <div
              :class="[
                isChildrenGrid ? 'pr-2 pl-6' : 'pl-6',
                !isShowBackground && 'pb-4.5',
              ]"
            >
              <slot name="childrenPrepend" :row="row" />
              <template v-if="!isChildrenGrid">
                <UiRowBackground
                  v-for="child in row.children"
                  :key="child.categoryId"
                  :color="child.category.color"
                  :type="isShowBackground ? 'standard' : props.backgroundType"
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
          </UiRowBackground>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
