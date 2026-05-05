<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
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
  leftMenuButton?: boolean
  leftMenuItems?: ContextMenuItem[][]
  lineWidth?: number
  stacked?: boolean
  to?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
  toggle: []
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const childCategoriesIds = computed(() => categoriesStore.getChildrenIds(props.categoryId))
const parentCategory = computed(() => categoriesStore.items[props.category?.parentId])
const hasChildren = computed(() => childCategoriesIds.value.length > 0)

const showInlineChevron = computed(() => !!props.leftMenuButton && !!props.isShowChevron && hasChildren.value)
const showRightChevron = computed(() => !props.leftMenuButton && !!props.isShowChevron && hasChildren.value)

const rowTo = computed(() => props.leftMenuButton && hasChildren.value ? undefined : props.to)

function onToggleClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  emit('toggle')
}

function onRowClick(e: Event) {
  if (props.leftMenuButton && hasChildren.value) {
    e.preventDefault()
    e.stopPropagation()
    emit('toggle')
    return
  }
  emit('click', e)
}
</script>

<template>
  <UiElement
    v-if="props.leftMenuButton && props.category"
    :isActive="props.activeItemId === props.categoryId"
    :class="props.class"
    :lineWidth="props.lineWidth"
    :insideClasses="`min-h-[46px] ${props.insideClasses ?? ''}`"
    :to="rowTo"
    @click="onRowClick"
  >
    <template #leftIcon>
      <UiIconBase
        :color="props.category.color"
        :name="props.category.icon"
        invert
        @click="emit('filter', props.categoryId ?? '')"
      />
    </template>

    <div class="flex grow items-center gap-1 overflow-hidden">
      <CategoriesName
        :stacked="props.stacked"
        :category="props.category"
        :parentCategory="parentCategory"
        :childrenCount="showInlineChevron ? undefined : childCategoriesIds.length"
        :isShowParent="props.isShowParent"
      />

      <Icon
        v-if="showInlineChevron"
        :name="props.isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
        size="18"
        class="text-muted shrink-0"
      />
    </div>

    <UDropdownMenu
      v-if="props.leftMenuItems"
      :items="props.leftMenuItems"
      :content="{ align: 'start', side: 'bottom' }"
    >
      <button
        type="button"
        class="flex-center text-muted hover:bg-elevated/50 -my-1 -mr-1 h-9 w-9 shrink-0 cursor-pointer rounded-sm"
        :aria-label="t('base.moreOptions')"
        @click.stop.prevent
      >
        <Icon name="lucide:ellipsis-vertical" size="18" />
      </button>
    </UDropdownMenu>
  </UiElement>

  <UiElement
    v-else-if="props.category"
    :isActive="props.activeItemId === props.categoryId"
    :class="props.class"
    :lineWidth="props.lineWidth"
    :insideClasses="`min-h-[46px] ${props.insideClasses ?? ''}`"
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
      v-if="showRightChevron"
      type="button"
      class="flex-center text-muted hover:bg-elevated/50 -mr-1 h-9 w-9 shrink-0 cursor-pointer rounded-sm"
      :aria-label="t('base.toggleExpand')"
      @click="onToggleClick"
    >
      <Icon
        :name="props.isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
        size="18"
      />
    </button>
  </UiElement>
</template>
