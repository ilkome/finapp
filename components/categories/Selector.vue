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
    class="_w-[90vw] max-h-[50vh] min-w-[260px] overflow-hidden overflow-y-auto bg-foreground-3 p-2 py-2"
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
        v-if="
          opened.includes(categoryId)
            && categoriesStore.items[categoryId].childIds
            && categoriesStore.items[categoryId].childIds?.length > 0
        "
        class="pl-4"
      >
        <CategoriesItem
          v-for="childCategoryId in categoriesStore.items[categoryId].childIds"
          :key="childCategoryId"
          v-close-popper.all
          :hide
          :category="categoriesStore.items[childCategoryId]"
          :categoryId="childCategoryId"
          class="group"
          @click.stop="select(childCategoryId, true)"
          @filter.stop="onFilter(childCategoryId)"
        />
      </div>
    </div>
  </div>
</template>
