<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  category: CategoryItem
  categoryId: CategoryId
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const isShow = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('trnForm.category.select')"
    :isOpen="isShow"
    :bottomSheetStyle="props.bottomSheetStyle"
    dragClassesCustom="bottomSheetDragClassesCustom h-full"
    isShowCloseBtn
    @openModal="isShow = true"
    @closeModal="isShow = false"
  >
    <template #trigger>
      <CategoriesItem
        :category="props.category"
        :categoryId="props.categoryId"
        stacked
        isShowParent
        insideClasses="bg-elevated/30 hover:bg-elevated/50 min-h-[42px] py-2"
      />
    </template>

    <template #custom="{ close }">
      <CategoriesCommandPalette
        :hide="close"
        :activeItemId="props.categoryId"
        class="min-w-80 px-3"
        @selected="(id: CategoryId) => { emit('selected', id); close() }"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
