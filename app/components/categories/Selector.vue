<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  hide?: () => null
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
    opened.value.includes(categoryId)
      ? (opened.value = opened.value.filter(id => id !== categoryId))
      : opened.value.push(categoryId)

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
  <div
    class="p-2 pt-1 pb-2"
  >
    <div
      v-for="categoryId in categoriesStore.categoriesRootIds"
      :key="categoryId"
      class="group"
      :class="{
        'overflow-hidden rounded-md bg-item-4': opened.includes(categoryId),
      }"
    >
      <CategoriesItem
        :categoryId
        :category="categoriesStore.items[categoryId]"
        @click="select(categoryId, false)"
        @filter.stop="onFilter(categoryId)"
      />

      <div
        v-if="opened.includes(categoryId) && categoriesStore.hasChildren(categoryId)"
        class="pl-4"
      >
        <CategoriesItem
          v-for="childCategoryId in categoriesStore.getChildsIds(categoryId)"
          :key="childCategoryId"
          v-close-popper.all
          :hide
          :category="categoriesStore.items[childCategoryId]"
          :categoryId="childCategoryId"
          @click.stop="select(childCategoryId, true)"
          @filter.stop="onFilter(childCategoryId)"
        />
      </div>
    </div>
  </div>
</template>
