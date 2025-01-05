<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

export type CategoryItemProps = {
  activeItemId?: string | 0 | false | null
  alt?: boolean
  category: CategoryItem
  categoryId: CategoryId
  class?: string
  isShowDots?: boolean
  isShowParent?: boolean
  lineWidth?: number
  slider?: any
}

const props = defineProps<CategoryItemProps>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() => categoriesStore.getChildsIds(props.categoryId))
const parentCategory = computed(() => categoriesStore.items[props.category?.parentId])
</script>

<template>
  <UiElement
    v-if="props.category"
    :isActive="props.activeItemId === props.categoryId"
    :class="props.class"
    :lineWidth="props.lineWidth"
    insideClasses="min-h-[46px]"
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

    <div class="text-3 grid grow gap-0.5">
      <CategoriesName
        :alt="props.alt"
        :category="props.category"
        :parentCategory="parentCategory"
        :hasChildren="childCategoriesIds.length > 0"
        :showChildrenCount="childCategoriesIds.length"
        :isShowParent="props.isShowParent"
      />
    </div>
  </UiElement>
</template>
