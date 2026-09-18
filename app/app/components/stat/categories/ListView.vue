<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CategoryListBackgroundType, CategoryListTrendType } from '~/components/stat/config/schema'
import type { CategoryWithData } from '~/components/stat/types'

export type StatCategoryRow = {
  category: CategoryItem
  children?: StatCategoryRow[]
  item: CategoryWithData
  parentCategory?: CategoryItem
}

const props = defineProps<{
  backgroundType: CategoryListBackgroundType
  /** Scale for the nested child bars; defaults to the parent scale. */
  childrenMaxCategoryValues?: { expense: number, income: number }
  currencyCode: string
  expandedIds?: CategoryId[]
  isLines?: boolean
  isRoundIcon?: boolean
  isShowParent?: boolean
  maxCategoryValues: { expense: number, income: number }
  rows: StatCategoryRow[]
  trendType: CategoryListTrendType
}>()

const emit = defineEmits<{
  amountClick: [categoryId: CategoryId]
  longPress: [categoryId: CategoryId]
  select: [categoryId: CategoryId]
  toggleExpand: [categoryId: CategoryId]
}>()

const isShowBackground = computed(() => props.backgroundType !== 'none')
const expanded = computed(() => new Set(props.expandedIds ?? []))

function isRowExpanded(row: StatCategoryRow) {
  return !!row.children?.length && expanded.value.has(row.item.id)
}

function onRowClick(row: StatCategoryRow) {
  if (row.children?.length)
    emit('toggleExpand', row.item.id)
  else
    emit('select', row.item.id)
}
</script>

<template>
  <div :class="isShowBackground && 'grid gap-1'" data-stat-block="categoriesList">
    <template v-for="(row, index) in props.rows" :key="row.item.id">
      <StatCategoriesLineView
        :backgroundType="props.backgroundType"
        :category="row.category"
        :currencyCode="props.currencyCode"
        :isExpanded="isRowExpanded(row)"
        :isLines="props.isLines"
        :isRoundIcon="props.isRoundIcon"
        :isShowParent="props.isShowParent && !row.children?.length"
        :item="row.item"
        :lineWidth="index === props.rows.length - 1 && !isRowExpanded(row) ? 0 : 1"
        :maxCategoryValues="props.maxCategoryValues"
        :parentCategory="row.parentCategory"
        :stacked="props.isShowParent && !row.children?.length"
        :trendType="props.trendType"
        class="group"
        :class="isRowExpanded(row) && '[&_.uiElementLine]:bg-transparent'"
        isShowChevron
        @amountClick="emit('amountClick', $event)"
        @click="onRowClick(row)"
        @longPress="emit('longPress', $event)"
      />

      <UCollapsible
        v-if="row.children?.length"
        :open="isRowExpanded(row)"
        :class="!isRowExpanded(row) && 'hidden'"
        :ui="{ content: 'overflow-hidden data-[state=open]:animate-none! data-[state=closed]:animate-none!' }"
      >
        <template #content>
          <div :class="isShowBackground && 'grid gap-1'" class="ml-5 pb-1 pl-3">
            <StatCategoriesLineView
              v-for="(child, childIndex) in row.children"
              :key="child.item.id"
              :backgroundType="props.backgroundType"
              :category="child.category"
              :currencyCode="props.currencyCode"
              :isLines="props.isLines"
              :isRoundIcon="props.isRoundIcon"
              :isShowParent="false"
              :item="child.item"
              :lineWidth="childIndex === row.children.length - 1 && index === props.rows.length - 1 ? 0 : 1"
              :maxCategoryValues="props.childrenMaxCategoryValues ?? props.maxCategoryValues"
              :parentCategory="child.parentCategory"
              :trendType="props.trendType"
              class="group"
              @amountClick="emit('amountClick', $event)"
              @click="emit('select', $event)"
              @longPress="emit('longPress', $event)"
            />
          </div>
        </template>
      </UCollapsible>
    </template>
  </div>
</template>
