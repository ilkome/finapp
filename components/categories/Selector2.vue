<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

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
  if (categoriesStore.isCategoryHasChildren(id)) {
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
  <div class="p-2 py-2.5">
    <template
      v-for="categoryId in props.ids"
      :key="categoryId"
    >
      <CategoriesItem
        :activeItemId="props.activeItemId"
        :categoryId="categoryId"
        :category="categoriesStore.items[categoryId]"
        class="group"
        @click="select(categoryId)"
        @filter.stop="onFilter(categoryId)"
      />
    </template>
  </div>
</template>
