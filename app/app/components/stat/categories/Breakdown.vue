<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { addEmptyCategoryViews } from '~/components/stat/categories/categoryViews'
import { useCategoriesBreakdown } from '~/components/stat/categories/useCategoriesBreakdown'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  baseCategoryViews?: CategoryViews
  block?: 'catsList' | 'vertical'
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  focusedCategoryId?: CategoryId
  focusedChildCategoryId?: CategoryId
  isOneCategory?: boolean
  isTwoColumnLayout?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
  storageKey: string
  type: SeriesSlugSelected | 'summary'
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  openCategory: [categoryId: CategoryId, filteredType?: SeriesSlugSelected]
  setCategoryFilter: [categoryId: CategoryId]
  setChildCategoryFilter: [categoryId: CategoryId]
}>()

const statConfig = inject(statConfigKey)!
const categoriesStore = useCategoriesStore()
const { categoriesWithData, focusedCategories, groupedCategories, ungroupedCategories } = useCategoriesBreakdown(props)
const isFocused = computed(() => !!props.focusedCategoryId)
const isHideOthersOnSelect = computed(() => statConfig.config.value.categories.round.isHideOthersOnSelect)
const displayedCategories = computed(() => isFocused.value ? focusedCategories.value : categoriesWithData.value)
// The focused child keeps its chip in periods where it has no transactions, so the selection
// stays visible instead of silently disappearing from the row.
const focusedCategoryViews = computed<CategoryViews>(() => {
  const childId = props.focusedChildCategoryId
  const categories = childId && !focusedCategories.value.some(category => category.id === childId)
    ? addEmptyCategoryViews(
      { grouped: focusedCategories.value, ungrouped: focusedCategories.value },
      categoriesStore.items,
      [childId],
      props.excludedCategoriesIds,
    ).ungrouped
    : focusedCategories.value
  return { grouped: categories, ungrouped: categories }
})
</script>

<template>
  <div
    v-if="displayedCategories.length > 0 && (!isFocused || props.block !== 'vertical')"
    class="grid content-start gap-3 @3xl/main:max-w-lg"
  >
    <StatCategoriesRoundSection
      v-if="isFocused"
      :baseCategoryViews="focusedCategoryViews"
      :filteredCategoriesIds="props.focusedChildCategoryId ? [props.focusedChildCategoryId] : []"
      :focusedCategoryId="props.focusedCategoryId"
      @setCategoryFilter="emit('setChildCategoryFilter', $event)"
    >
      <template #prepend>
        <button
          v-if="!isHideOthersOnSelect"
          type="button"
          class="relative flex shrink-0 items-center overflow-hidden rounded-2xl border border-transparent bg-elevated/30 p-1 hover:bg-elevated/50"
          :aria-label="$t('base.clear')"
          @click="emit('setCategoryFilter', props.focusedCategoryId!)"
        >
          <span class="flex size-6 items-center justify-center">
            <Icon name="i-lucide-x" size="14" />
          </span>
        </button>
      </template>
    </StatCategoriesRoundSection>

    <StatCategoriesVerticalSection
      v-if="!isFocused && props.block !== 'catsList'"
      :groupedCategories
      :isTwoColumnLayout="props.isTwoColumnLayout"
      :ungroupedCategories
      @clickCategory="emit('clickCategory', $event)"
    />

    <StatCategoriesListSection
      v-if="!isFocused && props.block !== 'vertical'"
      :categoriesWithData
      :groupedCategories
      :isOneCategory="props.isOneCategory"
      :storageKey="props.storageKey"
      :type="props.type"
      :ungroupedCategories
      @openCategory="(categoryId, filteredType) => emit('openCategory', categoryId, filteredType)"
    />
  </div>
</template>
