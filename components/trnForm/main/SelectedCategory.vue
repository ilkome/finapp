<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const $trnForm = useTrnFormStore()
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId | false>(
  () =>
    $trnForm.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0],
)
const category = computed<CategoryItem | false>(
  () => categoryId.value && categoriesStore.items[categoryId.value],
)
const parentCategory = computed<CategoryItem | false>(
  () => category.value && categoriesStore.items[category.value.parentId],
)
</script>

<template>
  <div
    v-if="category"
    class="relative flex items-center gap-x-3 rounded-md bg-item-4 px-3 py-2 hocus_bg-item-5"
    @click="$trnForm.ui.catsRootModal = true"
  >
    <div
      class="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-neutral-50"
      :style="{ background: category.color }"
    >
      <div :class="category.icon" />
    </div>

    <div class="grow truncate">
      <div
        v-if="parentCategory"
        class="text-xs text-item-2"
      >
        {{ parentCategory.name }}
      </div>

      <div class="text-sm leading-none">
        {{ category.name }}
      </div>
    </div>

    <div class="mdi mdi-dots-vertical -mr-1 text-lg text-item-2" />
  </div>
</template>
