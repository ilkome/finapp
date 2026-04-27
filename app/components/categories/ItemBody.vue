<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  class?: string
  insideClasses?: string
  isExpanded?: boolean
  isShowChevron?: boolean
  isShowParent?: boolean
  lineWidth?: number
  stacked?: boolean
  to?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
  toggle: []
}>()

const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() => categoriesStore.getChildrenIds(props.categoryId))
const parentCategory = computed(() => categoriesStore.items[props.category?.parentId])
const hasChildren = computed(() => childCategoriesIds.value.length > 0)

function onToggleClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  emit('toggle')
}
</script>

<template>
  <UiElement
    v-if="props.category"
    :isActive="props.activeItemId === props.categoryId"
    :class="props.class"
    :lineWidth="props.lineWidth"
    :insideClasses="`min-h-[46px] ${props.insideClasses}`"
    :to="props.to"
    @click="(e: Event) => emit('click', e)"
  >
    <template #leftIcon>
      <UiIconBase
        :color="props.category.color"
        :name="props.category.icon"
        invert
        @click="emit('filter', props.categoryId ?? '')"
      />
    </template>

    <div class="grid grow gap-0.5 overflow-hidden">
      <CategoriesName
        :stacked="props.stacked"
        :category="props.category"
        :parentCategory="parentCategory"
        :childrenCount="props.isShowChevron ? undefined : childCategoriesIds.length"
        :isShowParent="props.isShowParent"
      />
    </div>

    <button
      v-if="props.isShowChevron && hasChildren"
      type="button"
      class="flex-center text-muted -mr-1 h-9 w-9 shrink-0 cursor-pointer rounded-sm hover:bg-(--item-3)"
      :aria-label="$t('base.toggleExpand')"
      @click="onToggleClick"
    >
      <Icon
        :name="props.isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
        size="18"
      />
    </button>
  </UiElement>
</template>
