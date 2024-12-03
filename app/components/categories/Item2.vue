<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  isShowDots?: boolean
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
    insideClasses="flex-col items-center !bg-item-9 hocus:!bg-item-5"
    @click="(e: Event) => emit('click', e)"
  >
    <!-- <template #leftIcon>
      <UiIconBase
        :color="category.color"
        :name="category.icon"
        @click="e => emit('filter', e)"
      />
    </template> -->

    <div class="text-3 grid justify-center gap-0.5">
      <UiIconBase
        :color="category.color"
        :name="category.icon"
        class="!text-3xl"
        @click="e => emit('filter', e)"
      />

      <!-- Parent category name -->
      <div
        v-if="categoriesStore.items[categoryId].parentId"
        class="text-2xs leading-none opacity-90"
      >
        {{ categoriesStore.items[categoriesStore.items[categoryId].parentId].name }}
      </div>

      <!-- Category name -->
      <div class="flex items-center gap-2 text-sm leading-none">
        {{ categoriesStore.items[categoryId].name }}

        <!-- Has childs -->
        <div
          v-if="props.isShowDots && childCategoriesIds.length > 0"
          class="text-md font-secondary leading-none"
        >
          ...
        </div>
      </div>
    </div>
  </UiElement>
</template>
