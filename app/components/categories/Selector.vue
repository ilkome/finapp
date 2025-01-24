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
  setCategories: [ids: CategoryId[]]
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
  const childs = categoriesStore.getChildsIds(id)
  emit('setCategories', childs)
}

function isChildsSelected(categoryId: CategoryId) {
  return categoriesStore.getChildsIds(categoryId).some(id => props.selectedIds?.includes(id))
}

function isEveryChildsSelected(categoryId: CategoryId) {
  if (!categoriesStore.getChildsIds(categoryId).length)
    return false

  return categoriesStore.getChildsIds(categoryId).every(id => props.selectedIds?.includes(id))
}

onMounted(() => {
  props.selectedIds?.forEach((id) => {
    if (categoriesStore.items[id]?.parentId)
      opened.value.push(categoriesStore.items[id]?.parentId)
  })
})
</script>

<template>
  <div class="">
    <div
      v-for="categoryId in categoriesStore.categoriesRootIds"
      :key="categoryId"
      class="group/item"
      :class="{
        'bg-item-3 relative mb-2 rounded-md': opened.includes(categoryId),
        'bg-item-3 rounded-md': isChildsSelected(categoryId),
        '!border-accent-1/60 border': isEveryChildsSelected(categoryId),
      }"
    >
      <CategoriesItem
        :categoryId
        :lineWidth="4"
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
