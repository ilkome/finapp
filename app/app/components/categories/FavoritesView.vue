<script setup lang="ts">
import type { SelectorGridItem } from '~/components/categories/SelectorGridView.vue'
import type { CategoryId } from '~/components/categories/types'
import type { RowBackgroundType } from '~/components/ui/RowBackground.vue'

export type FavoritesSection = {
  /** No title for the fallback grid, which stands in for the whole list. */
  isShowNew?: boolean
  items: SelectorGridItem[]
  key: string
  title?: string
}

const props = defineProps<{
  activeItemId?: CategoryId
  backgroundType?: RowBackgroundType
  /** Titled sections fold under a toggle (the laptop form sidebar); keys listed here are folded. */
  collapsedKeys?: string[]
  isCollapsible?: boolean
  isRoundIcon?: boolean
  sections: FavoritesSection[]
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  new: []
  selected: [id: CategoryId]
  toggle: [key: string]
}>()
</script>

<template>
  <div>
    <div
      v-for="section in props.sections"
      :key="section.key"
    >
      <UCollapsible
        v-if="props.isCollapsible && section.title"
        :open="!props.collapsedKeys?.includes(section.key)"
      >
        <div class="flex items-stretch px-3">
          <UiTitleDropRight :isShown="!props.collapsedKeys?.includes(section.key)" :title="section.title" @click="emit('toggle', section.key)" />
        </div>

        <template #content>
          <CategoriesSelectorGridView
            :activeItemId="props.activeItemId"
            :backgroundType="props.backgroundType"
            :isRoundIcon="props.isRoundIcon"
            isTwoColumns
            :isShowNew="section.isShowNew"
            :items="section.items"
            :selectedIds="props.selectedIds"
            class="px-3 pt-1 pb-4"
            @new="emit('new')"
            @selected="emit('selected', $event)"
          />
        </template>
      </UCollapsible>

      <UiTitleModal v-else-if="section.title">
        {{ section.title }}
      </UiTitleModal>

      <CategoriesSelectorGridView
        v-if="!props.isCollapsible || !section.title"
        :activeItemId="props.activeItemId"
        :backgroundType="props.backgroundType"
        :isRoundIcon="props.isRoundIcon"
        isTwoColumns
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
