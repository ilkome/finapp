<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  categoryId: CategoryId
  isIconBg?: boolean
  isShowParent?: boolean
}>()

const categoriesStore = useCategoriesStore()
const category = computed(() => categoriesStore.items[props.categoryId])
const parentCategory = computed(() => {
  const parentId = category.value?.parentId
  return parentId ? categoriesStore.items[parentId] : undefined
})
</script>

<template>
  <div
    v-if="category"
    class="bg-elevated/10 hover:bg-elevated/30 relative flex items-center overflow-hidden rounded-2xl border border-transparent p-1 pr-3"
    :class="props.isIconBg ? 'gap-2' : 'gap-1'"
  >
    <div
      :style="{ backgroundColor: category.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div class="relative size-6">
      <UiIconBase
        v-if="props.isIconBg"
        :name="category.icon"
        :color="category.color"
        :size="14"
        class="!w-6 p-1"
        invert
      />
      <UiIconBase
        v-else
        :name="category.icon"
        :color="category.color"
        :size="14"
        class="!w-6 p-1"
      />
    </div>

    <div class="relative">
      <CategoriesName
        :category="category"
        :isShowParent="props.isShowParent"
        :parentCategory="parentCategory"
        stacked
        size="xs"
      />
      <slot />
    </div>
  </div>
</template>
