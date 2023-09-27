<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

defineProps<{
  ids: CategoryId[]
  activeItemId?: string | 0
  isHideParentCategory?: boolean
  slider?: object
}>()
</script>

<template lang="pug">
.grid.gap-y-1.gap-x-1.3sm_grid-cols-2.sm_gap-x-6
  CategoriesItem(
    v-for="categoryId in ids"
    :activeItemId="activeItemId"
    :category="$store.state.categories.items[categoryId]"
    :id="categoryId"
    :isHideParentCategory="isHideParentCategory"
    :key="categoryId"
    :slider="slider"
    v-on="$listeners"
  )
</template>
