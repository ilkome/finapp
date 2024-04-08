<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getStyles } from '~/components/ui/classes'

const props = defineProps<{
  // TODO: export type
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  isHideParentCategory?: boolean
  slider: any
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'onClickIcon'): void
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() =>
  categoriesStore.getChildCategoriesIds(props.categoryId),
)

const parentCategory = computed(
  () => categoriesStore.items[props.category?.parentId],
)

function onClickIcon() {
  if (props.slider)
    emit('click')

  emit('onClickIcon')
}
</script>

<template>
  <div
    v-if="category"
    class="flex items-center gap-x-3"
    :class="[
      { '!bg-item-3': activeItemId === categoryId },
      ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh']),
    ]"
    @click="emit('click')"
  >
    <Icon2
      :categoryId
      :color="category.color"
      :icon="category.icon"
      @click="onClickIcon"
    />

    <div class="grow truncate">
      <div
        v-if="parentCategory && !isHideParentCategory"
        class="text-xs text-item-2"
      >
        {{ parentCategory.name }}
      </div>

      <div class="text-secondary text-sm leading-none">
        {{ category.name }}
      </div>
    </div>

    <div
      v-if="childCategoriesIds.length > 0"
      class="text-md font-unica text-item-2"
    >
      {{ childCategoriesIds.length }}
    </div>
  </div>
</template>
