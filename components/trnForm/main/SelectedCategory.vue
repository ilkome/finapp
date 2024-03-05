<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const $trnForm = useTrnFormStore()
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId | false>(() =>
  $trnForm.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0],
)
const category = computed<CategoryItem | false>(() =>
  categoryId.value && categoriesStore.items[categoryId.value],
)
const parentCategory = computed<CategoryItem | false>(() =>
  category.value && categoriesStore.items[category.value.parentId],
)
</script>

<template lang="pug">
.cursor-pointer.py-2.px-3.relative.gap-x-3.flex.items-center.rounded-md.bg-item-4.hocus_bg-item-5(
  v-if="category"
  @click="$trnForm.ui.catsRootModal = true"
)
  .w-8.h-8.flex.items-center.justify-center.rounded-full.text-xl.leading-none.text-neutral-50(
    :style="{ background: category.color }"
  ): div(:class="category.icon")

  .grow.truncate
    .text-xs.text-item-2.dark_text-neutral-400(v-if="parentCategory").
      {{ parentCategory.name }}

    .leading-none.text-sm.text-neutral-700.dark_text-neutral-300.
      {{ category.name }}

  .mdi.mdi-dots-vertical.-mr-1.text-lg.text-item-2
</template>
