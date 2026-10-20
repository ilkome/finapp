<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { RowBackgroundType } from '~/components/ui/RowBackground.vue'

// One category row as the categories list draws it; lists put rows in `grid gap-1` so spacing matches everywhere.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** The categories view setting (`useCategoriesViewSettings`). */
  backgroundType?: RowBackgroundType
  category: CategoryItem
  categoryId: CategoryId
  chevron?: 'more' | 'right'
  isRoundIcon?: boolean
  parentCategory?: CategoryItem
  to?: string
}>(), { backgroundType: 'standard' })

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <UiRowBackground :color="props.category.color" :type="props.backgroundType" v-bind="$attrs">
    <CategoriesItemView
      :category="props.category"
      :categoryId="props.categoryId"
      :chevron="props.chevron"
      class="group relative"
      :isRoundIcon="props.isRoundIcon"
      isShowParent
      :lineWidth="0"
      :parentCategory="props.parentCategory"
      stacked
      :to="props.to"
      @click="emit('click', $event)"
    >
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </CategoriesItemView>
  </UiRowBackground>
</template>
