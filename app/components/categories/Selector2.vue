<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  hide?: () => null
  ids: CategoryId[]
}>()

const emit = defineEmits<{
  filter: [id: CategoryId]
  onClickParent: [id: CategoryId]
  onClose: []
  onSelected: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

function select(id: CategoryId) {
  if (categoriesStore.hasChildren(id)) {
    emit('onClickParent', id)
    return
  }

  emit('onSelected', id)
  emit('onClose')
  if (props.hide)
    props.hide()
}

function onFilter(id: CategoryId) {
  emit('filter', id)
}
</script>

<template>
  <div class="grid p-2 pt-1 3sm:grid-cols-2">
    <CategoriesItem
      v-for="categoryId in props.ids"
      :key="categoryId"
      :activeItemId="props.activeItemId"
      :categoryId="categoryId"
      :category="categoriesStore.items[categoryId]"
      :lineWidth="1"
      isShowParent
      alt
      @click="select(categoryId)"
      @filter.stop="onFilter(categoryId)"
    />
  </div>
</template>
