<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  alt?: boolean
  category: CategoryItem
  categoryId: CategoryId
  isHideDots?: boolean
  isHideParent?: boolean
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
    insideClasses="!min-h-[44px] lg:!min-h-[42px]"
    @click="(e: Event) => emit('click', e)"
  >
    <template #leftIcon>
      <UiIconBase
        :color="category.color"
        :name="category.icon"
        invert
        @click="(e: Event) => emit('filter', e)"
      />
    </template>

    <div class="grow grid gap-0.5 text-3">
      <CategoriesName
        :alt="props.alt"
        :category
        :parentCategory
        :hasChildren="childCategoriesIds.length > 0"
        :isHideParent="props.isHideParent"
      />
    </div>
  </UiElement>
</template>
