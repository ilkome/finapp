<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { resolveCategoryGrouping } from '~/components/stat/categories/categoryViews'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  groupedCategories: CategoryWithData[]
  ungroupedCategories: CategoryWithData[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
}>()

const statConfig = inject(statConfigKey)!

const barsConfig = computed(() => statConfig.config.value.categories.bars)
const isVerticalShow = computed(() => barsConfig.value.isShow)
const isShowTooltip = computed(() => barsConfig.value.isShowTooltip)
const isShowTooltipChildren = computed(() => barsConfig.value.isShowTooltipChildren)
const isShowListBackground = computed(() => statConfig.config.value.categories.list.backgroundType !== 'none')
const verticalCategories = computed<CategoryWithData[]>(() => resolveCategoryGrouping({
  grouped: props.groupedCategories,
  ungrouped: props.ungroupedCategories,
}, barsConfig.value.grouping))
const visibleVerticalCategories = computed(() => verticalCategories.value.filter(c => c.value !== 0))
const verticalMaxValues = computed(() => getMaxCategoryValues(verticalCategories.value))

function getChildrenMaxValues(item: CategoryWithData) {
  return getMaxCategoryValues(item.categories ?? [])
}
</script>

<template>
  <div v-if="isVerticalShow">
    <div class="grid">
      <div class="flex overflow-hidden overflow-x-auto pt-2 pl-1">
        <UTooltip
          v-for="item in visibleVerticalCategories"
          :key="item.id"
          :content="{ side: 'top', sideOffset: 8 }"
          :disabled="!isShowTooltip"
          :ui="{ content: 'h-auto w-80 max-w-[calc(100vw-2rem)] p-1' }"
        >
          <StatCategoriesVertical
            :item="item"
            :maxCategoryValues="verticalMaxValues"
            @click="emit('clickCategory', item.id)"
          />

          <template #content>
            <div class="pointer-events-none w-full text-left">
              <StatCategoriesLine
                :item="item"
                :isShowParent="!item.categories?.length"
                :lineWidth="0"
                :maxCategoryValues="verticalMaxValues"
                :stacked="!item.categories?.length"
              />

              <div
                v-if="isShowTooltipChildren && item.categories?.length"
                :class="isShowListBackground && 'grid gap-1'"
                class="pb-1"
              >
                <StatCategoriesLine
                  v-for="(child, index) in item.categories"
                  :key="child.id"
                  :isShowParent="false"
                  :item="child"
                  :lineWidth="index === item.categories.length - 1 ? 0 : 1"
                  :maxCategoryValues="getChildrenMaxValues(item)"
                  class="group"
                />
              </div>
            </div>
          </template>
        </UTooltip>
      </div>
    </div>
  </div>
</template>
