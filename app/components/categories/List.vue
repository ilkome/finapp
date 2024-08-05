<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

defineProps<{
  activeItemId?: string | 0 | false | null
  ids: CategoryId[]
  slider?: object
}>()

const emit = defineEmits<{
  click: [id: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <!-- <div class=""> -->
  <div class="grid grid-cols-3 gap-2 -items-center -justify-center -place-items-center">
    <CategoriesItem2
      v-for="categoryId in ids"
      :key="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :slider="slider"
      class=""
      @click="emit('click', categoryId)"
      @onClickIcon="emit('onClickIcon', categoryId)"
    />
  </div>
</template>
