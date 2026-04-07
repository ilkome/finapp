<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  class?: string
  insideClasses?: string
  isShowParent?: boolean
  lineWidth?: number
  stacked?: boolean
  to?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() => categoriesStore.getChildrenIds(props.categoryId))
const parentCategory = computed(() => categoriesStore.items[props.category?.parentId])
</script>

<template>
  <UiElement
    v-if="props.category"
    :isActive="props.activeItemId === props.categoryId"
    :class="props.class"
    :lineWidth="props.lineWidth"
    :insideClasses="`min-h-[46px] ${props.insideClasses}`"
    :to="props.to"
    @click="(e: Event) => emit('click', e)"
  >
    <template #leftIcon>
      <UiIconBase
        :color="props.category.color"
        :name="props.category.icon"
        invert
        @click="emit('filter', props.categoryId ?? '')"
      />
    </template>

    <div class="grid grow gap-0.5 overflow-hidden">
      <CategoriesName
        :stacked="props.stacked"
        :category="props.category"
        :parentCategory="parentCategory"
        :childrenCount="childCategoriesIds.length"
        :isShowParent="props.isShowParent"
      />
    </div>
  </UiElement>
</template>
