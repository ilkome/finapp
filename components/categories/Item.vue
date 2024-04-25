<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  // TODO: export type
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  isHideParentCategory?: boolean
  slider: any
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [e: Event]
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() =>
  categoriesStore.getChildCategoriesIds(props.categoryId),
)

// const parentCategory = computed(
//   () => categoriesStore.items[props.category?.parentId],
// )
</script>

<template>
  <div class="_group" @click="e => emit('click', e)">
    <div
      :class="[
        { '!bg-item-3': activeItemId === categoryId },
        ...getStyles('item', ['link', 'rounded', 'padding1', 'minh']),
      ]"
      class="-my-[1px] flex items-center gap-2"
    >
      <Icon2
        :categoryId
        :color="category.color"
        :icon="category.icon"
        @click="e => emit('filter', e)"
      />

      <div class="flex grow items-baseline gap-2">
        <div class="text-sm leading-none text-secondary">
          {{ category.name }}
        </div>

        <div
          v-if="category.parentId && !isHideParentCategory"
          class="grow text-right truncate text-xs text-item-2 opacity-60"
        >
          {{ categoriesStore.items[category.parentId].name }}
        </div>
      </div>

      <!-- <div class="flex items-center grow truncate">
        <div
          v-if="parentCategory && !isHideParentCategory"
          class="text-xs text-item-2"
        >
          {{ parentCategory.name }}
        </div>

        <div class="text-sm leading-none text-secondary">
          {{ category.name }}
        </div>
      </div> -->

      <div
        v-if="childCategoriesIds.length > 0"
        class="pr-1 text-md font-unica text-item-2"
      >
        {{ childCategoriesIds.length }}
      </div>
    </div>

    <div
      class="ml-12 mr-2 h-[1px] bg-item-5 group-last_hidden"
    />
  </div>
</template>
