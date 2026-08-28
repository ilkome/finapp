<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected } from '~/components/stat/types'

import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  groupedCategories: CategoryWithData[]
  isOneCategory?: boolean
  storageKey: string
  type: SeriesSlugSelected | 'summary'
  ungroupedCategories: CategoryWithData[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isVerticalShow = computed(() => statConfig.config.value.categories.bars.isShow)
const isVerticalGrouped = computed(() => statConfig.config.value.categories.bars.isGrouped)
const verticalCategories = computed<CategoryWithData[]>(() => isVerticalGrouped.value ? props.groupedCategories : props.ungroupedCategories)
const visibleVerticalCategories = computed(() => verticalCategories.value.filter(c => c.value !== 0))
const verticalMaxValues = computed(() => getMaxCategoryValues(verticalCategories.value))

const isVerticalShown = useStoredToggle(`${props.storageKey}-${props.type}-vertical`, true)
</script>

<template>
  <div v-if="isVerticalShow">
    <div class="flex items-center justify-between">
      <UiTitleCollapse
        class="grow"
        :isShown="isVerticalShown"
        @click="isVerticalShown = !isVerticalShown"
      >
        {{ t('stat.config.categories.vertical.title') }} {{ (!isVerticalShown && visibleVerticalCategories.length > 0) ? visibleVerticalCategories.length : '' }}
      </UiTitleCollapse>

      <div
        v-if="isVerticalShown && !props.isOneCategory"
        class="flex items-center"
      >
        <StatCategoriesGroupingToggle
          :isGrouped="isVerticalGrouped"
          @toggle="statConfig.config.value.categories.bars.isGrouped = !isVerticalGrouped"
        />
      </div>
    </div>

    <div
      v-if="isVerticalShown"
      class="grid"
    >
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
