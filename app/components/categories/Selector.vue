<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  hide?: () => null
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  filter: [id: CategoryId]
  onClose: []
  onSelected: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const opened = ref<CategoryId[]>([])

function select(categoryId: CategoryId, isForce: boolean) {
  if (!isForce && categoriesStore.hasChildren(categoryId)) {
    if (opened.value.includes(categoryId)) {
      opened.value = opened.value.filter(id => id !== categoryId)
    }
    else {
      opened.value.push(categoryId)
    }
    return
  }

  emit('onSelected', categoryId)
  emit('onClose')
  if (props.hide)
    props.hide()
}

function onFilter(id: CategoryId) {
  emit('filter', id)
}
</script>

<template>
  <div class="p-2 pt-1">
    <div
      v-for="categoryId in categoriesStore.categoriesRootIds"
      :key="categoryId"
      class="group"
      :class="{
        'bg-item-4 mb-2 overflow-hidden rounded-md': opened.includes(categoryId),
      }"
    >
      <CategoriesItem
        :categoryId
        :lineWidth="1"
        :category="categoriesStore.items[categoryId]"
        :activeItemId="props.selectedIds?.includes(categoryId) ? categoryId : null"
        @click="select(categoryId, false)"
        @filter.stop="onFilter(categoryId)"
      />

      <div
        v-if="opened.includes(categoryId) && categoriesStore.hasChildren(categoryId)"
        class="pb-2 pl-4 pr-2"
      >
        <CategoriesItem
          v-for="childCategoryId in categoriesStore.getChildsIds(categoryId)"
          :key="childCategoryId"
          :activeItemId="props.selectedIds?.includes(childCategoryId) ? childCategoryId : null"
          :category="categoriesStore.items[childCategoryId]"
          :categoryId="childCategoryId"
          @click.stop="select(childCategoryId, true)"
          @filter.stop="onFilter(childCategoryId)"
        />
      </div>
    </div>
  </div>
</template>
