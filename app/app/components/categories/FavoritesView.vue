<script setup lang="ts">
import type { SelectorGridItem } from '~/components/categories/SelectorGridView.vue'
import type { CategoryId } from '~/components/categories/types'

export type FavoritesSection = {
  /** No title for the fallback grid, which stands in for the whole list. */
  isShowNew?: boolean
  items: SelectorGridItem[]
  key: string
  title?: string
}

const props = defineProps<{
  activeItemId?: CategoryId
  sections: FavoritesSection[]
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  new: []
  selected: [id: CategoryId]
}>()
</script>

<template>
  <div>
    <div
      v-for="section in props.sections"
      :key="section.key"
    >
      <UiTitleModal v-if="section.title">
        {{ section.title }}
      </UiTitleModal>

      <CategoriesSelectorGridView
        :activeItemId="props.activeItemId"
        :isShowNew="section.isShowNew"
        :items="section.items"
        :selectedIds="props.selectedIds"
        class="px-3 pt-1"
        @new="emit('new')"
        @selected="emit('selected', $event)"
      />
    </div>
  </div>
</template>
