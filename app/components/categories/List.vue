<script setup lang="ts">
import type { CategoryItemProps } from '~/components/categories/Item.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  categoriesItemProps?: Partial<CategoryItemProps>
  getContextMenuItems?: (categoryId: CategoryId) => any[][] | undefined
  ids: CategoryId[]
  insideClasses?: string
}>()

const emit = defineEmits<{
  click: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div class="pt-1">
    <CategoriesItem
      v-for="categoryId in ids"
      :key="categoryId"
      :activeItemId="activeItemId"
      :category="categoriesStore.items[categoryId]!"
      :categoryId="categoryId"
      :contextMenuItems="props.getContextMenuItems?.(categoryId)"
      :insideClasses="props.insideClasses"
      :lineWidth="1"
      v-bind="categoriesItemProps"
      @click="emit('click', categoryId)"
    />
  </div>
</template>
