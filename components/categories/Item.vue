<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
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
    class="group"
    @click="e => emit('click', e)"
  >
    <template #leftIcon>
      <Icon2
        :categoryId
        :color="category.color"
        :icon="category.icon"
        @click="e => emit('filter', e)"
      />
    </template>

    <div>
      <!-- Parent category name -->
      <div
        v-if="categoriesStore.items[categoryId].parentId"
        class="text-2xs"
      >
        {{ categoriesStore.items[categoriesStore.items[categoryId].parentId].name }}
      </div>

      <!-- Category name -->
      <div class="flex items-center gap-2 text-secondary text-sm leading-none">
        {{ categoriesStore.items[categoryId].name }}

        <!-- Has childs -->
        <div
          v-if="childCategoriesIds.length > 0"
          class="text-md font-unica"
        >
          ...
        </div>
      </div>
    </div>
  </UiElement>
</template>
