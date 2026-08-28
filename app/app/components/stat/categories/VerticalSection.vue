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

const isVerticalShow = computed(() => statConfig.config.value.categories.bars.isShow)
const verticalCategories = computed<CategoryWithData[]>(() => resolveCategoryGrouping({
  grouped: props.groupedCategories,
  ungrouped: props.ungroupedCategories,
}, statConfig.config.value.categories.bars.grouping))
const visibleVerticalCategories = computed(() => verticalCategories.value.filter(c => c.value !== 0))
const verticalMaxValues = computed(() => getMaxCategoryValues(verticalCategories.value))
</script>

<template>
  <div v-if="isVerticalShow">
    <div class="grid">
      <div class="flex overflow-hidden overflow-x-auto pt-2 pl-1">
        <StatCategoriesVertical
          v-for="item in visibleVerticalCategories"
          :key="item.id"
          :item="item"
          :maxCategoryValues="verticalMaxValues"
          @click="emit('clickCategory', item.id)"
        />
      </div>
    </div>
  </div>
</template>
