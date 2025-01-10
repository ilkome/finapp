<script setup lang="ts">
import type { CategoryItemProps } from '~/components/categories/Item.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  categoriesItemProps?: Partial<CategoryItemProps>
  ids: CategoryId[]
  insideClasses?: string
  slider?: object
}>()

const emit = defineEmits<{
  click: [id: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div class="pt-1">
    <CategoriesItem
      v-for="categoryId in ids"
      :key="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :slider="slider"
      :insideClasses="props.insideClasses"
      :lineWidth="1"
      isShowDots
      v-bind="categoriesItemProps"
      @click="emit('click', categoryId)"
      @onClickIcon="emit('onClickIcon', categoryId)"
    />
  </div>
</template>
