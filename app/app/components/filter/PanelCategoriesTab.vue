<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

defineProps<{
  selectedIds: CategoryId[]
}>()

const emit = defineEmits<{
  removeCategories: [ids: CategoryId[]]
  selected: [id: CategoryId]
  setCategories: [ids: CategoryId[]]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="h-full scrollerBlock overflow-y-auto pb-2">
    <CategoriesFavorites
      :selectedIds="selectedIds"
      @selected="id => emit('selected', id)"
    />

    <UiTitleModal>
      {{ t('categories.title') }}
    </UiTitleModal>

    <CategoriesSelectorTree
      :selectedIds="selectedIds"
      embedded
      hideSearch
      @removeCategories="ids => emit('removeCategories', ids)"
      @selected="id => emit('selected', id)"
      @setCategories="ids => emit('setCategories', ids)"
    />
  </div>
</template>
