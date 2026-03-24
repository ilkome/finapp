<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { compareCategoryIds } from '~/components/categories/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()

const categoryIds = computed(() => {
  const seen = new Set<CategoryId>()
  const ids: CategoryId[] = []

  for (const id of categoriesStore.favoriteCategoriesIds) {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  for (const id of categoriesStore.recentCategoriesIds) {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  return ids.sort((a, b) => compareCategoryIds(a, b, categoriesStore.items))
})

function onClick(categoryId: CategoryId) {
  if (!categoriesStore.isTransactible(categoryId))
    return

  trnsFormStore.openFormForCreate()
  trnsFormStore.$patch((state) => {
    state.values.amount = [0, 0, 0]
    state.values.amountRaw = ['', '', '']
    state.values.categoryId = categoryId
    state.ui.isShow = true
    state.values.date = Date.now()
  })
}
</script>

<template>
  <div class="flex flex-wrap justify-center gap-1 gap-y-2">
    <div
      v-for="categoryId in categoryIds"
      :key="categoryId"
      class="dark:bg-item-3 relative flex cursor-default items-center gap-2 overflow-hidden rounded-2xl border border-transparent p-1 pr-3 hover:bg-(--item-5)"
      @click="onClick(categoryId)"
    >
      <div
        :style="{ backgroundColor: categoriesStore.items[categoryId]?.color }"
        class="absolute inset-0 size-full opacity-10"
      />

      <div class="size-6">
        <UiIconBase
          :name="categoriesStore.items[categoryId]?.icon"
          :color="categoriesStore.items[categoryId]?.color"
          :size="14"
          class="!w-6 p-1"
          invert
        />
      </div>

      <CategoriesName
        v-if="categoriesStore.items[categoryId]"
        :category="categoriesStore.items[categoryId]!"
        :isShowParent="!!categoriesStore.items[categoryId]?.parentId"
        :parentCategory="categoriesStore.items[categoryId]?.parentId ? categoriesStore.items[categoriesStore.items[categoryId]!.parentId] : undefined"
        stacked
        size="xs"
      />
    </div>
  </div>
</template>
