<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const emit = defineEmits<{
  selectCategory: [id: CategoryId]
}>()

const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <CategoriesFavorites
    :activeItemId="trnsFormStore.values.categoryId ?? undefined"
    showFallback
    @selected="id => emit('selectCategory', id)"
  />
</template>
