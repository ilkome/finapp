<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatCategoryRow } from '~/components/stat/categories/ListView.vue'
import type { CategoryListBackgroundType, CategoryListTrendType } from '~/components/stat/config/schema'

import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'

const props = defineProps<{
  backgroundType: CategoryListBackgroundType
  currencyCode: string
  isLines?: boolean
  isRoundIcon?: boolean
  isShowTooltip?: boolean
  isShowTooltipChildren?: boolean
  maxCategoryValues: { expense: number, income: number }
  rows: StatCategoryRow[]
  trendType: CategoryListTrendType
}>()

const emit = defineEmits<{
  longPress: [categoryId: CategoryId]
  select: [categoryId: CategoryId]
}>()

const isShowBackground = computed(() => props.backgroundType !== 'none')

function childrenMaxValues(row: StatCategoryRow) {
  return getMaxCategoryValues(row.children?.map(child => child.item) ?? [])
}
</script>

<template>
  <div class="flex overflow-hidden overflow-x-auto pt-2 pl-1" data-stat-block="categoriesVertical">
    <UTooltip
      v-for="row in props.rows"
      :key="row.item.id"
      :content="{ side: 'top', sideOffset: 8 }"
      :disabled="!props.isShowTooltip"
      :ui="{ content: 'h-auto w-80 max-w-[calc(100vw-2rem)] p-1' }"
    >
      <StatCategoriesVerticalView
        :category="row.category"
        :item="row.item"
        :maxCategoryValues="props.maxCategoryValues"
        @click="emit('select', $event)"
        @longPress="emit('longPress', $event)"
      />

      <template #content>
        <div class="pointer-events-none w-full text-left">
          <StatCategoriesLineView
            :backgroundType="props.backgroundType"
            :category="row.category"
            :currencyCode="props.currencyCode"
            :isLines="props.isLines"
            :isRoundIcon="props.isRoundIcon"
            :isShowParent="!row.children?.length"
            :item="row.item"
            :lineWidth="0"
            :maxCategoryValues="props.maxCategoryValues"
            :parentCategory="row.parentCategory"
            :stacked="!row.children?.length"
            :trendType="props.trendType"
          />

          <div
            v-if="props.isShowTooltipChildren && row.children?.length"
            :class="isShowBackground && 'grid gap-1'"
            class="pb-1"
          >
            <StatCategoriesLineView
              v-for="(child, index) in row.children"
              :key="child.item.id"
              :backgroundType="props.backgroundType"
              :category="child.category"
              :currencyCode="props.currencyCode"
              :isLines="props.isLines"
              :isRoundIcon="props.isRoundIcon"
              :isShowParent="false"
              :item="child.item"
              :lineWidth="index === row.children.length - 1 ? 0 : 1"
              :maxCategoryValues="childrenMaxValues(row)"
              :parentCategory="child.parentCategory"
              :trendType="props.trendType"
              class="group"
            />
          </div>
        </div>
      </template>
    </UTooltip>
  </div>
</template>
