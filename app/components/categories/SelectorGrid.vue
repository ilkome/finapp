<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  ids: CategoryId[]
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const itemClasses = 'bg-elevated/30 rounded-sm'

function select(id: CategoryId) {
  if (categoriesStore.hasChildren(id))
    return

  emit('selected', id)
}
</script>

<template>
  <div class="3sm:grid-cols-2 grid gap-1">
    <CategoriesItem
      v-for="categoryId in props.ids"
      :key="categoryId"
      :activeItemId="props.activeItemId"
      :categoryId="categoryId"
      :class="itemClasses"
      :category="categoriesStore.items[categoryId]!"
      isShowParent
      stacked
      @click="select(categoryId)"
    />
  </div>
</template>
