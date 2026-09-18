<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { computeBarStyle, formatCompactAmount } from '~/components/stat/categories/barUtils'
import { useLongPressClick } from '~/components/stat/categories/useLongPressClick'

const props = defineProps<{
  category: CategoryItem
  item: CategoryWithData
  maxCategoryValues: {
    expense: number
    income: number
  }
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  longPress: [categoryId: CategoryId]
}>()

const amount = computed(() => formatCompactAmount(props.item.value))
const barStyle = computed(() =>
  computeBarStyle(props.item.value, props.category.color, props.maxCategoryValues, 'height'),
)

const longPressRef = ref(null)
useLongPressClick(longPressRef, () => props.item.id, {
  onClick: id => emit('click', id),
  onLongPress: id => emit('longPress', id),
})
</script>

<template>
  <div
    ref="longPressRef"
    :data-stat-category-quick-view="props.item.id"
    class="rounded-sm p-1 pt-5 pb-2 hover:bg-elevated"
  >
    <div class="flex h-28 items-end rounded-sm bg-elevated">
      <div
        class="relative w-7 rounded-t"
        :style="barStyle"
      >
        <div
          :class="cn('absolute top-[-14px] w-full text-center font-secondary text-xs leading-none',
                     props.item.value > 0 && 'text-income-1',
          )"
        >
          {{ amount }}
        </div>
      </div>
    </div>

    <UiIconBase
      :name="props.category.icon"
      :color="props.category.color"
      :size="20"
      invert
      class="rounded-none rounded-b p-0"
    />
  </div>
</template>
