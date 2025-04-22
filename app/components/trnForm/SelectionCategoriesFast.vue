<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const emit = defineEmits<{
  close: []
  onSelectCategory: [id: CategoryId]
  onSelectParentCategory: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <!-- Favorite categories -->
  <div v-if="categoriesStore.favoriteCategoriesIds.length > 0">
    <UiTitleModal>
      {{ t('categories.favoriteCategories') }}
    </UiTitleModal>

    <CategoriesSelector2
      :activeItemId="trnsFormStore.values.categoryId"
      :hide="emit('close')"
      :ids="categoriesStore.favoriteCategoriesIds"
      @onClickParent="id => emit('onSelectParentCategory', id)"
      @onSelected="id => emit('onSelectCategory', id)"
    />
  </div>

  <!-- Recent categories -->
  <div v-if="categoriesStore.recentCategoriesIds.length > 0">
    <UiTitleModal>
      {{ t('categories.recentCategories') }}
    </UiTitleModal>

    <CategoriesSelector2
      :activeItemId="trnsFormStore.values.categoryId"
      :hide="emit('close')"
      :ids="categoriesStore.recentCategoriesIds"
      @onClickParent="id => emit('onSelectParentCategory', id)"
      @onSelected="id => emit('onSelectCategory', id)"
    />
  </div>
</template>
