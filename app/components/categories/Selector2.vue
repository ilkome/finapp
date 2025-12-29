<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getStyles } from '~/components/ui/getStyles'

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
const itemClasses = getStyles('item', ['alt', 'rounded'])

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
