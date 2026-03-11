<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const emit = defineEmits<{
  selectCategory: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()

const isShowAllCategoriesFallback = computed(() =>
  categoriesStore.favoriteCategoriesIds.length === 0
  && categoriesStore.recentCategoriesIds.length === 0
  && categoriesStore.categoriesIdsForTrnValues.length > 0,
)
</script>

<template>
  <!-- Favorite categories -->
  <div
    v-if="categoriesStore.favoriteCategoriesIds.length > 0"
    class="pt-2"
  >
    <UiTitleCollapse arrow="right" class="mx-2">
      {{ t('categories.favoriteCategories') }}
    </UiTitleCollapse>

    <CategoriesSelectorGrid
      :activeItemId="trnsFormStore.values.categoryId ?? undefined"

      :ids="categoriesStore.favoriteCategoriesIds"

      @selected="id => emit('selectCategory', id)"
    />
  </div>

  <!-- Recent categories -->
  <div v-if="categoriesStore.recentCategoriesIds.length > 0">
    <UiTitleModal>
      {{ t('categories.recentCategories') }}
    </UiTitleModal>

    <CategoriesSelectorGrid
      :activeItemId="trnsFormStore.values.categoryId ?? undefined"

      :ids="categoriesStore.recentCategoriesIds"

      @selected="id => emit('selectCategory', id)"
    />
  </div>

  <!-- All categories fallback when no favorites and no recent -->
  <div v-if="isShowAllCategoriesFallback">
    <CategoriesSelectorGrid
      :activeItemId="trnsFormStore.values.categoryId ?? undefined"

      :ids="categoriesStore.categoriesIdsForTrnValues"

      @selected="id => emit('selectCategory', id)"
    />
  </div>
</template>
