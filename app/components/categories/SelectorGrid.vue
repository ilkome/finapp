<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  hide?: () => void
  ids: CategoryId[]
}>()

const emit = defineEmits<{
  clickParent: [id: CategoryId]
  close: []
  filter: [id: CategoryId]
  selected: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const itemClasses = 'bg-item-3 rounded-sm'

function select(id: CategoryId) {
  if (categoriesStore.hasChildren(id)) {
    emit('clickParent', id)
    return
  }

  emit('selected', id)
  emit('close')
  if (props.hide)
    props.hide()
}

function onFilter(id: CategoryId) {
  emit('filter', id)
}
</script>

<template>
  <div class="3sm:grid-cols-2 grid gap-1 px-3 pt-1">
    <CategoriesItem
      v-for="categoryId in props.ids"
      :key="categoryId"
      :activeItemId="props.activeItemId"
      :categoryId="categoryId"
      :class="itemClasses"
      :category="categoriesStore.items[categoryId]"
      isShowParent
      alt
      @click="select(categoryId)"
      @filter.stop="onFilter(categoryId)"
    />
  </div>
</template>
