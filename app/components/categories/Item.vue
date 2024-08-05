<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  isHideDots?: boolean
  lineWidth?: number
  slider?: any
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [e: Event]
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() => categoriesStore.getChildsIds(props.categoryId))
const parentCategory = computed(() => categoriesStore.items[props.category.parentId])
</script>

<template>
  <UiElement
    :isActive="activeItemId === categoryId"
    :lineWidth="props.lineWidth"
    @click="(e: Event) => emit('click', e)"
  >
    <template #leftIcon>
      <UiIconBase
        :color="category.color"
        :name="category.icon"
        @click="(e: Event) => emit('filter', e)"
      />
    </template>

    <div class="grid gap-0.5 text-3">
      <CategoriesName
        :category
        :parentCategory
        :hasChildren="childCategoriesIds.length > 0"
      />
    </div>
  </UiElement>
</template>
