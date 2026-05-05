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
    <CategoriesRoundPill
      v-for="categoryId in categoryIds"
      :key="categoryId"
      :categoryId="categoryId"
      :isShowParent="!!categoriesStore.items[categoryId]?.parentId"
      isIconBg
      class="cursor-default"
      @click="onClick(categoryId)"
    />
  </div>
</template>
