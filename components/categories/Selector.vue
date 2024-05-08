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

function select(id: CategoryId, isForce: boolean) {
  if (!isForce && categoriesStore.hasChildren(id))
    return

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
  <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto max-h-[50vh] _w-[90vw] min-w-[260px]">
    <template
      v-for="categoryId in categoriesStore.categoriesRootIds"
      :key="categoryId"
    >
      <CategoriesItem
        v-if="!categoriesStore.items[categoryId].childIds || categoriesStore.items[categoryId].childIds?.length === 0"
        :categoryId="categoryId"
        :category="categoriesStore.items[categoryId]"
        class="group"
        @click="select(categoryId, false)"
        @filter.stop="onFilter(categoryId)"
      />

      <!-- Position on left -->
      <VDropdown
        v-else
        :overflowPadding="12"
        autoBoundaryMaxSize
        placement="bottom-start"
        class="group"
      >
        <CategoriesItem
          :categoryId="categoryId"
          :category="categoriesStore.items[categoryId]"
          @filter.stop="onFilter(categoryId)"
        />

        <template #popper="{ hide: hideIn }">
          <div class="flex items-center px-3 h-12">
            <UiTitle>{{ categoriesStore.items[categoryId].name }}</UiTitle>
            <BaseBottomSheetClose
              v-if="categoriesStore.items[categoryId].childIds"
              v-close-popper
            />
            <BaseBottomSheetClose
              v-else
              v-close-popper.all
            />
          </div>

          <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto w-[90vw] max-w-xs max-h-[60vh]">
            <CategoriesItem
              v-for="childCategoryId in categoriesStore.items[categoryId].childIds"
              :key="childCategoryId"
              :hide
              :category="categoriesStore.items[childCategoryId]"
              :categoryId="childCategoryId"
              class="group"
              @click.stop="select(childCategoryId, true)"
              @filter.stop="onFilter(childCategoryId)"
            />
          </div>
        </template>
      </VDropdown>
    </template>
  </div>
</template>
