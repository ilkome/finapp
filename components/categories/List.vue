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

const emit = defineEmits<{
  click: [id: CategoryId]
  onClickIcon: [id: CategoryId]
}>()
const categoriesStore = useCategoriesStore()

function onClickIcon(categoryId: CategoryId) {
  console.log('categoryId', categoryId)
  emit('onClickIcon', categoryId)
}
</script>

<template>
  <div class="grid gap-1 sm:gap-x-6">
    <CategoriesItem
      v-for="categoryId in ids"
      :key="categoryId"
      :categoryId="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]"
      :isHideParentCategory="isHideParentCategory"
      :slider="slider"
      @click="emit('click', categoryId)"
      @onClickIcon="onClickIcon(categoryId)"
    />
  </div>
</template>
