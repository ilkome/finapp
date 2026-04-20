<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'

import { useStorage } from '@vueuse/core'

import type { CategoryId, CategoryItemWithId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

type CategoryCommandPaletteItem = CommandPaletteItem & CategoryItemWithId
type CategoryFilter = 'all' | 'favorites'

const props = defineProps<{
  activeItemId?: CategoryId
  hide?: () => void
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const filter = useStorage<CategoryFilter>('finapp-categories-selector-filter', 'all')

const hasFavorites = computed(() => categoriesStore.favoriteCategoriesIds.length > 0)
const hasRecent = computed(() => categoriesStore.recentCategoriesIds.length > 0)
const isShowTabs = computed(() => hasFavorites.value || hasRecent.value)

watch(isShowTabs, (show) => {
  if (!show && filter.value !== 'all')
    filter.value = 'all'
}, { immediate: true })

watch([hasFavorites, hasRecent], () => {
  if (filter.value === 'favorites' && !hasFavorites.value && !hasRecent.value)
    filter.value = 'all'
}, { immediate: true })

function buildCategoryItem(id: CategoryId) {
  const category = categoriesStore.items[id]!
  const parentId = category.parentId
  const parent = parentId ? categoriesStore.items[parentId] : null
  return {
    id,
    ...category,
    suffix: parent?.name ?? category.name,
  }
}

const allCats = computed(() => {
  const adjustmentCategory = categoriesStore.items.adjustment!
  const adjustmentGroup = {
    ...adjustmentCategory,
    id: 'adjustment',
    items: [{
      id: 'adjustment',
      ...adjustmentCategory,
      suffix: adjustmentCategory.name,
    }],
    slot: 'category',
  }

  const rootGroups = categoriesStore.categoriesRootIds.map((id) => {
    const category = categoriesStore.items[id]!
    const children = categoriesStore.getChildrenIds(id)
    const items = children.length
      ? children.map(childId => ({
          id: childId,
          ...categoriesStore.items[childId],
          suffix: category.name,
        }))
      : [{
          id,
          ...category,
          suffix: category.name,
        }]

    return {
      ...category,
      id,
      items,
      slot: 'category',
    }
  })

  return [adjustmentGroup, ...rootGroups]
})

function onSelect(item: CategoryCommandPaletteItem) {
  emit('selected', item.id)
  if (props.hide)
    props.hide()
}

function selectId(id: CategoryId) {
  emit('selected', id)
  if (props.hide)
    props.hide()
}
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <!-- @vue-ignore -->
    <UCommandPalette
      v-if="filter === 'all'"
      :placeholder="t('categories.search.placeholder')"
      :groups="allCats"
      labelKey="name"
      :ui="{ root: '-mt-3 h-full', viewport: isShowTabs ? 'pb-16' : '' }"
      @update:modelValue="onSelect"
    >
      <template #category="{ item: rawItem }">
        <div
          class="flex w-full items-center gap-3"
          :class="{ 'text-primary': (rawItem as CategoryCommandPaletteItem).id === props.activeItemId }"
        >
          <UiIconBase
            :color="(rawItem as CategoryCommandPaletteItem).color"
            :name="(rawItem as CategoryCommandPaletteItem).icon"
            invert
          />
          <CategoriesName
            :category="(rawItem as CategoryCommandPaletteItem)"
          />
        </div>
      </template>
    </UCommandPalette>

    <div
      v-else
      class="scrollerBlock grid h-full content-start gap-4 overflow-y-auto pt-px pb-16"
    >
      <CategoriesSelectorGrid
        v-if="hasFavorites"
        :activeItemId="props.activeItemId"
        :ids="categoriesStore.favoriteCategoriesIds"
        @selected="selectId"
      />
      <div v-if="hasRecent">
        <div class="font-tertiary sticky top-0 z-20 pt-5 pb-4 text-lg leading-none font-semibold">
          {{ t('categories.recentCategories') }}
        </div>
        <CategoriesSelectorGrid
          :activeItemId="props.activeItemId"
          :ids="categoriesStore.recentCategoriesIds"
          class="pt-px"
          @selected="selectId"
        />
      </div>
    </div>

    <template v-if="isShowTabs">
      <div
        class="pointer-events-none absolute bottom-0 left-0 z-10 h-12 w-full"
        style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
      />
      <div class="pointer-events-none absolute bottom-2 left-0 z-20 w-full px-2">
        <div class="border-default/80 bg-default/20 pointer-events-auto rounded-2xl border p-1 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50">
          <UiTabsScroll class="flex gap-1">
            <UiTabsItemFill :isActive="filter === 'all'" @click="filter = 'all'">
              {{ t('common.all') }}
            </UiTabsItemFill>
            <UiTabsItemFill :isActive="filter === 'favorites'" @click="filter = 'favorites'">
              {{ t('categories.favorite') }}
            </UiTabsItemFill>
          </UiTabsScroll>
        </div>
      </div>
    </template>
  </div>
</template>
