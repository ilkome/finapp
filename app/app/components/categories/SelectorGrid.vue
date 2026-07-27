<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  getContextMenuItems?: (categoryId: CategoryId) => ContextMenuItem[][] | undefined
  ids: CategoryId[]
  onNew?: () => void
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const itemClasses = 'bg-elevated/30 rounded-sm'

function select(id: CategoryId) {
  if (categoriesStore.hasChildren(id))
    return

  emit('selected', id)
}
</script>

<template>
  <div class="grid gap-1 3sm:grid-cols-2">
    <CategoriesItem
      v-for="categoryId in props.ids"
      :key="categoryId"
      :activeItemId="props.activeItemId"
      :categoryId="categoryId"
      :class="itemClasses"
      :category="categoriesStore.items[categoryId]!"
      :contextMenuItems="props.getContextMenuItems?.(categoryId)"
      :selectedIds="props.selectedIds"
      isShowParent
      stacked
      @click="select(categoryId)"
    />

    <button
      v-if="props.onNew"
      type="button"
      :class="cn('-my-0.25 flex min-h-11.5 items-center gap-3 interactive px-2 py-1.5', itemClasses)"
      :aria-label="t('categories.new')"
      @click="props.onNew"
    >
      <div class="flex-center size-8 shrink-0 rounded-full bg-elevated/60 text-icon-primary">
        <Icon name="lucide:plus" size="18" />
      </div>
      <span class="text-sm text-muted">{{ t('categories.new') }}</span>
    </button>
  </div>
</template>
