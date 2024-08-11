<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const emit = defineEmits<{
  close: []
  onSelectCategory: [id: CategoryId]
  onSelectParentCategory: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const trnFormStore = useTrnFormStore()
</script>

<template>
  <!-- Favorite categories -->
  <div
    v-if="categoriesStore.favoriteCategoriesIds.length > 0"
  >
    <UiTitle
      class="z-10 sticky pt-4 pb-2 top-0 px-3 bg-foreground-1"
      @click="trnFormStore.ui.catsRootModal = true"
    >
      {{ $t("categories.favoriteTitle") }}
      {{ $t("categories.title") }}
    </UiTitle>

    <CategoriesSelector2
      :activeItemId="trnFormStore.values.categoryId"
      :hide="emit('close')"
      :ids="categoriesStore.favoriteCategoriesIds"
      @onClickParent="id => emit('onSelectParentCategory', id)"
      @onSelected="id => emit('onSelectCategory', id)"
    />
  </div>

  <!-- Recent categories -->
  <div
    v-if="categoriesStore.recentCategoriesIds.length > 0"
    class="pt-6"
  >
    <UiTitle
      class="z-10 sticky pt-4 pb-2 top-0 px-3 bg-foreground-1"
      @click="trnFormStore.ui.catsRootModal = true"
    >
      {{ $t("categories.lastUsedTitle") }}
      {{ $t("categories.title") }}
    </UiTitle>

    <CategoriesSelector2
      :activeItemId="trnFormStore.values.categoryId"
      :hide="emit('close')"
      :ids="categoriesStore.recentCategoriesIds"
      @onClickParent="id => emit('onSelectParentCategory', id)"
      @onSelected="id => emit('onSelectCategory', id)"
    />
  </div>
</template>
