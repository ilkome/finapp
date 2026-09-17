<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { compareCategoryIds } from '~/components/categories/utils'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const statConfig = useStatConfigCtx()

// Same source and look as the round categories block, so the empty-period placeholder
// follows the view settings instead of its own rules.
const roundConfig = computed(() => statConfig.categories.value.round)

const categoryIds = computed(() => {
  const ids = new Set<CategoryId>([
    ...(roundConfig.value.isShowFavorites ? categoriesStore.favoriteCategoriesIds : []),
    ...(roundConfig.value.isShowRecent ? categoriesStore.recentCategoriesIds : []),
  ])
  return [...ids].sort((a, b) => compareCategoryIds(a, b, categoriesStore.items))
})

function onClick(categoryId: CategoryId) {
  trnsFormStore.openFormForCategory(categoryId)
}
</script>

<template>
  <div class="flex flex-wrap justify-center gap-1 gap-y-2">
    <CategoriesRoundPill
      v-for="categoryId in categoryIds"
      :key="categoryId"
      :categoryId="categoryId"
      :isIconBg="roundConfig.isIconBg"
      :isShowParent="!!categoriesStore.items[categoryId]?.parentId"
      class="cursor-default"
      @click="onClick(categoryId)"
    />
  </div>
</template>
