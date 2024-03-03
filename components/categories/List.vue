<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

defineProps<{
  // TODO: export type
  activeItemId?: string | 0 | false | null
  ids: CategoryId[]
  isHideParentCategory?: boolean
  slider?: object
}>()

const emit = defineEmits(['click', 'onClickIcon'])
const categoriesStore = useCategoriesStore()
</script>

<template>
  <div class="grid gap-y-1 gap-x-1.3sm grid-cols-2 sm:gap-x-6">
    <CategoriesItem
      v-for="categoryId in ids"
      :id="categoryId"
      :key="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]"
      :isHideParentCategory="isHideParentCategory"
      :slider="slider"
      @click="emit('click', categoryId)"
      @onClickIcon="emit('onClickIcon', categoryId)"
    />
  </div>
</template>
