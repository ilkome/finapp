<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  isAllowSelectParentCategory?: boolean
  hide?: () => null
}>()

const emit = defineEmits<{
  onSelected: [id: CategoryId]
  onClose: []
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
      />

      <VDropdown
        v-else
        :overflowPadding="12"
        autoBoundaryMaxSize
        class="group"
      >
        <CategoriesItem
          :categoryId="categoryId"
          :category="categoriesStore.items[categoryId]"
        />

        <template #popper>
          <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto w-[90vw] max-w-xs max-h-[60vh]">
            <CategoriesItem
              v-for="childCategoryId in categoriesStore.items[categoryId].childIds"
              :key="childCategoryId"
              v-close-popper.all
              :category="categoriesStore.items[childCategoryId]"
              :categoryId="childCategoryId"
              class="group"
              @click="select(childCategoryId, false)"
            />
          </div>
        </template>
      </VDropdown>
    </template>
  </div>
</template>
