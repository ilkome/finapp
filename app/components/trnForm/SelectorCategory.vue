<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  category: CategoryItem
  categoryId: CategoryId
  title?: string
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const isShow = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title"
    :isOpen="isShow"
    :bottomSheetStyle="props.bottomSheetStyle"
    dragClassesCustom="h-full max-w-md"
    isShowCloseBtn
    @openModal="isShow = true"
    @closeModal="isShow = false"
  >
    <template #trigger>
      <CategoriesItem
        :category="props.category"
        :categoryId="props.categoryId"
        alt
        insideClasses="bg-item-3 min-h-[42px] py-2"
      />
    </template>

    <template #custom="{ close }">
      <CategoriesCommandPalette
        :hide="close"
        :activeItemId="props.categoryId"
        class="bottomSheetContentInside -mt-2 min-w-72"
        @selected="(id: CategoryId) => { emit('selected', id); close() }"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
