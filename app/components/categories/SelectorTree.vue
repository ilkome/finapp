<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
  setCategories: [ids: CategoryId[]]
}>()

const categoriesStore = useCategoriesStore()
const opened = ref<CategoryId[]>([])

const childrenMap = computed(() => {
  const map = new Map<CategoryId, CategoryId[]>()
  for (const id of categoriesStore.categoriesRootIds)
    map.set(id, categoriesStore.getChildrenIds(id))
  return map
})

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

  emit('selected', categoryId)
}

function onFilter(id: CategoryId) {
  emit('setCategories', childrenMap.value.get(id) ?? [])
}

function isChildsSelected(categoryId: CategoryId) {
  return (childrenMap.value.get(categoryId) ?? []).some(id => props.selectedIds?.includes(id))
}

function isEveryChildsSelected(categoryId: CategoryId) {
  const children = childrenMap.value.get(categoryId) ?? []
  if (!children.length)
    return false

  return children.every(id => props.selectedIds?.includes(id))
}

onMounted(() => {
  props.selectedIds?.forEach((id) => {
    if (categoriesStore.items[id]?.parentId)
      opened.value.push(categoriesStore.items[id]?.parentId)
  })
})
</script>

<template>
  <div>
    <div
      v-for="categoryId in categoriesStore.categoriesRootIds"
      :key="categoryId"
      class="group/item"
      :class="{
        'bg-item-3 relative mb-2 rounded-md': opened.includes(categoryId),
        'bg-item-3 rounded-md': isChildsSelected(categoryId),
        'border !border-(--ui-primary)/60': isEveryChildsSelected(categoryId),
      }"
    >
      <CategoriesItem
        :categoryId
        :lineWidth="4"
        :category="categoriesStore.items[categoryId]!"
        :activeItemId="props.selectedIds?.includes(categoryId) ? categoryId : null"
        @click="select(categoryId, false)"
        @filter.stop="onFilter(categoryId)"
      />

      <div
        v-if="opened.includes(categoryId) && categoriesStore.hasChildren(categoryId)"
        class="pr-2 pb-2 pl-4"
      >
        <CategoriesItem
          v-for="childCategoryId in childrenMap.get(categoryId)"
          :key="childCategoryId"
          :activeItemId="props.selectedIds?.includes(childCategoryId) ? childCategoryId : null"
          :category="categoriesStore.items[childCategoryId]!"
          :categoryId="childCategoryId"
          @click.stop="select(childCategoryId, true)"
          @filter.stop="onFilter(childCategoryId)"
        />
      </div>
    </div>
  </div>
</template>
