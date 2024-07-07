<script setup lang="ts">
import type { CategoryId } from '../categories/types'
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
  <div
    v-if="parentCategoryId && categoriesStore.items[parentCategoryId]?.childIds?.length > 0"
    :style="{ height: props.maxHeight }"
    class="swiper-slide"
  >
    <div class="h-full overflow-y-auto scrollerBlock pb-3">
      <div>
        <UiTitle class="z-10 sticky pt-4 pb-2 top-0 px-3 bg-foreground-3">
          {{ categoriesStore.items[parentCategoryId]?.name }}
        </UiTitle>

        <CategoriesSelector2
          :activeItemId="trnFormStore.values.categoryId"
          :hide="emit('close')"
          :ids="categoriesStore.items[parentCategoryId]?.childIds"
          class="grid 2sm:grid-cols-2"
          @onClickParent="id => emit('onSelectParentCategory', id)"
          @onSelected="id => emit('onSelectCategory', id)"
        />
      </div>
    </div>
  </div>
</template>
