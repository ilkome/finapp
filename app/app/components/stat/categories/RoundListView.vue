<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

const props = defineProps<{
  currencyCode: string
  isIconBg?: boolean
  isInlineAmount?: boolean
  isShowAmount?: boolean
  isShowParent?: boolean
  rows: Array<{ category: CategoryItem, item: CategoryWithData, parentCategory?: CategoryItem }>
  selectedIds?: CategoryId[]
  /** Unique per list so the same category in two clouds never shares a view-transition name. */
  transitionScope?: string
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  longPress: [categoryId: CategoryId]
}>()

const selected = computed(() => new Set(props.selectedIds ?? []))

function transitionName(categoryId: CategoryId) {
  return props.transitionScope ? `statCat-${props.transitionScope}-${categoryId}`.replace(/[^\w-]/g, '_') : undefined
}
</script>

<template>
  <div class="flex min-w-0 flex-wrap justify-start gap-1 gap-y-2" data-stat-block="categoriesRound">
    <slot name="prepend" />

    <StatCategoriesRoundView
      v-for="row in props.rows"
      :key="row.item.id"
      :category="row.category"
      :currencyCode="props.currencyCode"
      :isIconBg="props.isIconBg"
      :isInlineAmount="props.isInlineAmount"
      :isShowAmount="props.isShowAmount"
      :isShowParent="props.isShowParent"
      :item="row.item"
      :parentCategory="row.parentCategory"
      :style="{ viewTransitionName: transitionName(row.item.id) }"
      :class="{
        'opacity-60': selected.size > 0 && !selected.has(row.item.id),
        'opacity-50': !selected.has(row.item.id) && row.item.value === 0,
        'border-primary/40!': selected.has(row.item.id),
      }"
      class="transition-opacity"
      @click="emit('click', $event)"
      @longPress="emit('longPress', $event)"
    />
  </div>
</template>
