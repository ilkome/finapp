<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  lineWidth?: number
  slider?: any
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [e: Event]
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() =>
  categoriesStore.getChildsIds(props.categoryId),
)
</script>

<template>
  <UiElement
    :isActive="activeItemId === categoryId"
    :lineWidth="props.lineWidth"
    @click="(e: Event) => emit('click', e)"
  >
    <template #leftIcon>
      <!-- <UiIconBase
        :color="category.color"
        :name="category.icon"
        @click="e => emit('filter', e)"
      /> -->

      <div
        class="-size-8"
      >
        <UiIconBase
          :name="category?.icon"
          :color="category?.color"
          invert
        />
      </div>
    </template>

    <div class="grid gap-0.5 text-3">
      <!-- Parent category name -->
      <div
        v-if="categoriesStore.items[categoryId].parentId"
        class="text-2xs opacity-90 leading-none"
      >
        {{ categoriesStore.items[categoriesStore.items[categoryId].parentId].name }}
      </div>

      <!-- Category name -->
      <div class="flex items-center gap-2 text-sm leading-none">
        {{ categoriesStore.items[categoryId].name }}

        <!-- Has childs -->
        <div
          v-if="childCategoriesIds.length > 0"
          class="text-md font-unica leading-none"
        >
          ...
        </div>
      </div>
    </div>
  </UiElement>
</template>
