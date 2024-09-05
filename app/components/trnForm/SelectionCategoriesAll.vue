<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  maxHeight: string
  parentCategoryId?: CategoryId
}>()

const emit = defineEmits<{
  close: []
  onSelectCategory: [id: CategoryId]
  onSelectParentCategory: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const trnFormStore = useTrnFormStore()
</script>

<template>
  <div class="h-full overflow-y-auto scrollerBlock pb-3">
    <div>
      <UiTitle3 class="z-10 sticky pt-4 pb-2 top-0 px-3 bg-foreground-1">
        {{ $t("categories.title") }}
      </UiTitle3>

      <CategoriesSelector2
        :activeItemId="parentCategoryId || trnFormStore.values.categoryId"
        :hide="emit('close')"
        :ids="categoriesStore.categoriesRootIds"
        @onClickParent="id => emit('onSelectParentCategory', id)"
        @onSelected="id => emit('onSelectCategory', id)"
      />
    </div>
  </div>
</template>
