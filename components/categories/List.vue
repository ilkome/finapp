<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { getStyles } from '~/components/ui/getStyles'
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
  <div>
    <CategoriesItem
      v-for="categoryId in ids"
      :key="categoryId"
      class="group"
      :categoryId="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]"
      :slider="slider"
      @click="emit('click', categoryId)"
      @onClickIcon="emit('onClickIcon', categoryId)"
    />
  </div>
</template>
