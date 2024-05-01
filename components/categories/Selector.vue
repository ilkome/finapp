<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  hide?: () => null
  isAllowSelectParentCategory?: boolean
}>()

const emit = defineEmits<{
  filter: [id: CategoryId]
  onClose: []
  onSelected: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()

function select(id: CategoryId, isForce: boolean) {
  if (!isForce && categoriesStore.isCategoryHasChildren(id))
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
  <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto w-[90vw] max-w-xs max-h-[60vh]">
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

      <VDropdown
        v-else
        :overflowPadding="18"
        autoBoundaryMaxSize
        class="group"
      >
        <CategoriesItem
          :categoryId="categoryId"
          :category="categoriesStore.items[categoryId]"
          @filter.stop="onFilter(categoryId)"
        />

        <template #popper>
          <div class="flex items-center px-3 h-12">
            <UiTitle>{{ categoriesStore.items[categoryId].name }}</UiTitle>
            <BaseBottomSheetClose v-close-popper />
          </div>

          <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto w-[90vw] max-w-xs max-h-[60vh]">
            <CategoriesItem
              v-for="childCategoryId in categoriesStore.items[categoryId].childIds"
              :key="childCategoryId"
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
