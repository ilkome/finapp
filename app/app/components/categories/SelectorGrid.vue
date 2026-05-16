<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  getContextMenuItems?: (categoryId: CategoryId) => ContextMenuItem[][] | undefined
  ids: CategoryId[]
  onNew?: () => void
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
  <div class="3sm:grid-cols-2 grid gap-1">
    <CategoriesItem
      v-for="categoryId in props.ids"
      :key="categoryId"
      :activeItemId="props.activeItemId"
      :categoryId="categoryId"
      :class="itemClasses"
      :category="categoriesStore.items[categoryId]!"
      :contextMenuItems="props.getContextMenuItems?.(categoryId)"
      isShowParent
      stacked
      @click="select(categoryId)"
    />

    <button
      v-if="props.onNew"
      type="button"
      :class="cn('interactive flex min-h-[46px] items-center gap-3 px-2 py-1.5 -my-[1px]', itemClasses)"
      :aria-label="t('categories.new')"
      @click="props.onNew"
    >
      <div class="flex-center text-icon-primary bg-elevated/60 size-8 shrink-0 rounded-full">
        <Icon name="lucide:plus" size="18" />
      </div>
      <span class="text-muted text-sm">{{ t('categories.new') }}</span>
    </button>
  </div>
</template>
