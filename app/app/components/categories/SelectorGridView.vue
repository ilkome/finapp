<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { RowBackgroundType } from '~/components/ui/RowBackground.vue'

export type SelectorGridItem = {
  category: CategoryItem
  categoryId: CategoryId
  childrenCount?: number
  contextMenuItems?: ContextMenuItem[][]
  parentCategory?: CategoryItem
  to?: string
}

const props = defineProps<{
  activeItemId?: CategoryId
  backgroundType?: RowBackgroundType
  isRoundIcon?: boolean
  isShowNew?: boolean
  /** The transaction form keeps two columns at any width; the page widens to more. */
  isTwoColumns?: boolean
  items: SelectorGridItem[]
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  new: []
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const newClasses = 'rounded-md bg-elevated/30'
</script>

<template>
  <!-- Fills a column top to bottom before the next one, like child categories in ListView. -->
  <div
    class="columns-2 gap-x-1 *:mb-1 *:break-inside-avoid"
    :class="!props.isTwoColumns && 'sm:columns-[12rem] sm:gap-x-10'"
  >
    <UiRowBackground
      v-for="item in props.items"
      :key="item.categoryId"
      :color="item.category.color"
      :type="props.backgroundType ?? 'standard'"
    >
      <CategoriesItemView
        :activeItemId="props.activeItemId"
        :category="item.category"
        :categoryId="item.categoryId"
        :childrenCount="item.childrenCount"
        class="block"
        :contextMenuItems="item.contextMenuItems"
        :isRoundIcon="props.isRoundIcon"
        :parentCategory="item.parentCategory"
        :selectedIds="props.selectedIds"
        :to="item.to"
        isShowParent
        stacked
        @click="!item.childrenCount && emit('selected', item.categoryId)"
      />
    </UiRowBackground>

    <button
      v-if="props.isShowNew"
      type="button"
      :class="cn('flex min-h-11.5 w-full items-center gap-3 interactive px-2 py-1.5', newClasses)"
      :aria-label="t('categories.new')"
      @click="emit('new')"
    >
      <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated/60 text-icon-primary">
        <Icon name="lucide:plus" size="18" />
      </div>
      <span class="text-sm text-muted">{{ t('categories.new') }}</span>
    </button>
  </div>
</template>
