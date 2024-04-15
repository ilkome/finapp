<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { getStyles } from '~/components/ui/classes'
import { useCategoriesStore } from '~/components/categories/useCategories'

defineProps<{
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
</script>

<template>
  <div>
    <CategoriesItem
      v-for="categoryId in ids"
      :key="categoryId"
      :categoryId="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]"
      :isHideParentCategory="isHideParentCategory"
      :slider="slider"
      @click="emit('click', categoryId)"
      @onClickIcon="emit('onClickIcon', categoryId)"
    />
  </div>
</template>
