<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  activeItemId?: string | 0 | false | null
  category: CategoryItem
  categoryId: CategoryId
  childrenCount?: number
  class?: string
  contextMenuItems?: ContextMenuItem[][]
  hideLeftMenuButton?: boolean
  insideClasses?: string
  isExpanded?: boolean
  isRoundIcon?: boolean
  isShowChevron?: boolean
  isShowChildrenCount?: boolean
  isShowParent?: boolean
  leftMenuButton?: boolean
  lineWidth?: number
  parentCategory?: CategoryItem
  selectedIds?: CategoryId[]
  stacked?: boolean
  to?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
  filter: [categoryId: CategoryId]
  toggle: []
}>()

const { t } = useI18n()

// Multi-select (filter) highlights every id in selectedIds; single-select falls
// back to the activeItemId match.
const isActive = computed(() =>
  props.selectedIds
    ? props.selectedIds.includes(props.categoryId)
    : props.activeItemId === props.categoryId,
)

const hasChildren = computed(() => (props.childrenCount ?? 0) > 0)

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
  <UiContextMenuMy :items="props.contextMenuItems" :disabled="!props.contextMenuItems">
    <UiElement
      v-if="props.leftMenuButton && props.category"
      :isActive="isActive"
      :class="props.class"
      class="[&_.uiElementLine]:block!"
      :lineWidth="props.lineWidth"
      :insideClasses="`min-h-[46px] ${props.insideClasses ?? ''}`"
      :to="rowTo"
      @click="onRowClick"
    >
      <template #leftIcon>
        <UiIconBase
          :color="props.category.color"
          :name="props.category.icon"
          :class="props.isRoundIcon === false ? 'w-6!' : undefined"
          :invert="props.isRoundIcon !== false"
          @click="emit('filter', props.categoryId ?? '')"
        />
      </template>

      <div class="flex grow items-center gap-1 overflow-hidden">
        <CategoriesName
          :stacked="props.stacked"
          :category="props.category"
          :parentCategory="props.parentCategory"
          :childrenCount="props.isShowChildrenCount || !showInlineChevron ? props.childrenCount : undefined"
          :isShowParent="props.isShowParent"
        />

        <Icon
          v-if="showInlineChevron"
          :name="props.isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          size="18"
          class="shrink-0 text-muted"
        />
      </div>

      <UDropdownMenu
        v-if="props.contextMenuItems && !props.hideLeftMenuButton"
        :items="props.contextMenuItems"
        :content="{ align: 'start', side: 'bottom' }"
      >
        <button
          type="button"
          class="-my-1 -mr-1 flex-center size-9 shrink-0 rounded-sm text-muted hover:bg-elevated/50"
          :aria-label="t('base.moreOptions')"
          @click.stop.prevent
        >
          <Icon name="lucide:ellipsis-vertical" size="18" />
        </button>
      </UDropdownMenu>
    </UiElement>

    <UiElement
      v-else-if="props.category"
      :isActive="isActive"
      :class="props.class"
      class="[&_.uiElementLine]:block!"
      :lineWidth="props.lineWidth"
      :insideClasses="`min-h-[46px] ${props.insideClasses ?? ''}`"
      :to="props.to"
      @click="(e: Event) => emit('click', e)"
    >
      <template #leftIcon>
        <UiIconBase
          :color="props.category.color"
          :name="props.category.icon"
          :class="props.isRoundIcon === false ? 'w-6!' : undefined"
          :invert="props.isRoundIcon !== false"
          @click="emit('filter', props.categoryId ?? '')"
        />
      </template>

      <div class="grid grow gap-0.5 overflow-hidden">
        <CategoriesName
          :stacked="props.stacked"
          :category="props.category"
          :parentCategory="props.parentCategory"
          :childrenCount="props.isShowChevron ? undefined : props.childrenCount"
          :isShowParent="props.isShowParent"
        />
      </div>

      <button
        v-if="showRightChevron"
        type="button"
        class="-mr-1 flex-center size-9 shrink-0 rounded-sm text-muted hover:bg-elevated/50"
        :aria-label="t('base.toggleExpand')"
        @click="onToggleClick"
      >
        <Icon
          :name="props.isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          size="18"
        />
      </button>
    </UiElement>
  </UiContextMenuMy>
</template>
