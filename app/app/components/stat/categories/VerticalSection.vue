<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'
import type { CategoryWithData } from '~/components/stat/types'

import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { resolveCategoryGrouping } from '~/components/stat/categories/categoryViews'
import { useStatCategoryRows } from '~/components/stat/categories/useStatCategoryRows'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const props = defineProps<{
  isOneCategory?: boolean
  views: CategoryViews
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
}>()

const statConfig = useStatConfigCtx()

const barsConfig = computed(() => statConfig.categories.value.bars)
const listConfig = computed(() => statConfig.categories.value.list)
// Same as the list: inside a category page the parent group is the page itself.
const verticalCategories = computed<CategoryWithData[]>(() => resolveCategoryGrouping(props.views, props.isOneCategory ? 'child' : barsConfig.value.grouping))
const visibleVerticalCategories = computed(() => verticalCategories.value.filter(c => c.value !== 0))
const verticalMaxValues = computed(() => getMaxCategoryValues(verticalCategories.value))
const { currencyCode, openFormForCategory, rows } = useStatCategoryRows(visibleVerticalCategories)
</script>

<template>
  <div v-if="barsConfig.isShow" class="grid">
    <StatCategoriesVerticalListView
      :backgroundType="listConfig.backgroundType"
      :currencyCode
      :isLines="listConfig.isLines"
      :isRoundIcon="listConfig.isRoundIcon"
      :isShowTooltip="barsConfig.isShowTooltip"
      :isShowTooltipChildren="barsConfig.isShowTooltipChildren"
      :maxCategoryValues="verticalMaxValues"
      :rows
      :trendType="listConfig.trendType"
      @longPress="openFormForCategory"
      @select="emit('clickCategory', $event)"
    />
  </div>
</template>
