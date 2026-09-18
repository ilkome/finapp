<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export type SelectorGridItem = {
  category: CategoryItem
  categoryId: CategoryId
  childrenCount?: number
  contextMenuItems?: ContextMenuItem[][]
  parentCategory?: CategoryItem
}

const props = defineProps<{
  activeItemId?: CategoryId
  isShowNew?: boolean
  items: SelectorGridItem[]
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  new: []
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const itemClasses = 'rounded-md bg-elevated/30'
</script>

<template>
  <div class="grid gap-1 3sm:grid-cols-2">
    <CategoriesItemView
      v-for="item in props.items"
      :key="item.categoryId"
      :activeItemId="props.activeItemId"
      :category="item.category"
      :categoryId="item.categoryId"
      :childrenCount="item.childrenCount"
      :class="itemClasses"
      :contextMenuItems="item.contextMenuItems"
      :parentCategory="item.parentCategory"
      :selectedIds="props.selectedIds"
      isShowParent
      stacked
      @click="!item.childrenCount && emit('selected', item.categoryId)"
    />

    <button
      v-if="props.isShowNew"
      type="button"
      :class="cn('-my-0.25 flex min-h-11.5 items-center gap-3 interactive px-2 py-1.5', itemClasses)"
      :aria-label="t('categories.new')"
      @click="emit('new')"
    >
      <div class="flex-center size-8 shrink-0 rounded-full bg-elevated/60 text-icon-primary">
        <Icon name="lucide:plus" size="18" />
      </div>
      <span class="text-sm text-muted">{{ t('categories.new') }}</span>
    </button>
  </div>
</template>
