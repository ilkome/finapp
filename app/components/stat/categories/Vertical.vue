<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { computeBarStyle, formatCompactAmount } from '~/components/stat/categories/barUtils'
import { useCategoryLongPress } from '~/components/stat/categories/useCategoryLongPress'

const props = defineProps<{
  item: CategoryWithData
  maxCategoryValues: {
    expense: number
    income: number
  }
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

const category = computed(() => categoriesStore.items[props.item.id])

const barStyle = computed(() =>
  computeBarStyle(props.item.value, category.value?.color, props.maxCategoryValues, 'height'),
)

const amount = computed(() => formatCompactAmount(props.item.value))

const { longPressRef } = useCategoryLongPress(
  () => props.item.id,
  () => emit('click', props.item.id),
)
</script>

<template>
  <div
    v-if="category"
    ref="longPressRef"
    class="rounded-sm p-1 pb-4 hover:bg-(--item-5)"
  >
    <div class="bg-item-3 flex h-28 items-end rounded-sm">
      <div
        class="relative w-7 rounded-t"
        :style="barStyle"
      >
        <div
          :class="cn('font-secondary absolute top-[-14px] w-full text-center text-xs leading-none',
                     props.item.value > 0 && 'text-income-1',
          )"
        >
          {{ amount }}
        </div>
      </div>
    </div>

    <UiIconBase
      :name="category?.icon"
      :color="category?.color"
      :size="20"
      invert
      class="rounded-none rounded-b p-0"
    />
  </div>
</template>
