<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  category: CategoryItem
  categoryId: CategoryId
  isLaptop: boolean
  title?: string
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
  onSelected: [id: CategoryId]
}>()

const isShow = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title"
    :isOpen="isShow"
    :bottomSheetStyle="props.bottomSheetStyle"
    drugClassesCustom="h-full max-w-md"
    isShowCloseBtn
    @onOpenModal="isShow = true"
    @onCloseModal="isShow = false"
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
        class="min-w-72 -mt-2 bottomSheetContentInside"
        @onSelected="(id: CategoryId) => { emit('onSelected', id); close() }"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
