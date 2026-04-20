<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoriesExpanded } from '~/components/stat/categories/useCategoriesExpanded'
import { useStatCategories } from '~/components/stat/categories/useStatCategories'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { resolveGrouped } from '~/components/stat/useStatConfig'

const props = defineProps<{
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
  storageKey: string
  type: SeriesSlugSelected | StatTabSlug
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  setCategoryFilter: [categoryId: CategoryId]
}>()

const { t } = useI18n()
const { computeCategoriesWithData } = useStatCategories()
const categoriesStore = useCategoriesStore()
const statConfig = inject(statConfigKey)!

// Config
const catsList = computed(() => statConfig.config.value.catsList)
const isVerticalShow = computed(() => statConfig.config.value.vertical.isShow)
const isVerticalGrouped = computed(() => statConfig.config.value.vertical.isGrouped)
const isListShow = computed(() => catsList.value.isShow)
const isListGrouped = computed(() => resolveGrouped(catsList.value.isGrouped, statConfig.config.value.grouping))
const isLines = computed(() => catsList.value.isLines)

// Categories data (lazy — each variant computed only when accessed)
const groupedCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], true))
const ungroupedCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], false))

const categoriesWithData = computed<CategoryWithData[]>(() => {
  const rawGrouped = statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped
  const isGrouped = resolveGrouped(rawGrouped, statConfig.config.value.grouping)

  if (statConfig.config.value.isShowEmptyCategories && props.preCategoriesIds?.length)
    return computeCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped, props.preCategoriesIds)

  return isGrouped ? groupedCategories.value : ungroupedCategories.value
})

// Vertical
const verticalCategories = computed<CategoryWithData[]>(() => isVerticalGrouped.value ? groupedCategories.value : ungroupedCategories.value)
const visibleVerticalCategories = computed(() => verticalCategories.value.filter(c => c.value !== 0))
const verticalMaxValues = computed(() => getMaxCategoryValues(verticalCategories.value))

// List
const linesCategories = computed<CategoryWithData[]>(() => isListGrouped.value ? groupedCategories.value : ungroupedCategories.value)
const linesMaxValues = computed(() => getMaxCategoryValues(linesCategories.value))
const childrenMaxValues = computed(() => getMaxCategoryValues(categoriesWithData.value))

function getMaxCategoryValues(categories: CategoryWithData[]) {
  const income = categories.find(c => c.value > 0)?.value ?? 0
  const expense = categories.find(c => c.value < 0)?.value ?? 0
  return { expense: Math.abs(expense), income }
}

// Expand/collapse state
const {
  folderIcon,
  isExpanded,
  toggle: toggleCategory,
  toggleAll: toggleAllCategories,
} = useCategoriesExpanded(
  props.storageKey,
  categoriesStore.items ?? {},
  categoriesWithData,
)

function onParentClick(item: CategoryWithData) {
  if (item.categories?.length)
    toggleCategory(item.id)
  else
    emit('clickCategory', item.id)
}

function onToggleListGrouping() {
  if (statConfig.config.value.grouping !== 'auto') {
    statConfig.updateConfig('grouping', 'auto')
    return
  }
  statConfig.updateConfig('catsList', { isGrouped: !isListGrouped.value })
}
</script>

<template>
  <div
    v-if="categoriesWithData.length > 0"
    class="grid content-start gap-3 @3xl/main:max-w-lg"
  >
    <!-- Vertical -->
    <UiToggle
      v-if="isVerticalShow"
      :storageKey="`${storageKey}-${type}-vertical`"
      :initStatus="true"
    >
      <template #header="{ toggle, isShown }">
        <div class="flex items-center justify-between">
          <UiTitleCollapse :isShown @click="toggle">
            {{ t('stat.config.categories.vertical.title') }} {{ (!isShown && visibleVerticalCategories.length > 0) ? visibleVerticalCategories.length : '' }}
          </UiTitleCollapse>

          <div
            v-if="isShown && !props.isOneCategory"
            class="flex items-center"
          >
            <StatCategoriesGroupingToggle
              :isGrouped="isVerticalGrouped"
              @toggle="statConfig.config.value.vertical.isGrouped = !isVerticalGrouped"
            />
          </div>
        </div>

        <div
          v-if="isShown"
          class="grid"
        >
          <div class="flex overflow-hidden overflow-x-auto pt-2 pl-1">
            <StatCategoriesVertical
              v-for="item in visibleVerticalCategories"
              :key="item.id"
              :item="item"
              :maxCategoryValues="verticalMaxValues"
              @click="emit('clickCategory', item.id)"
            />
          </div>
        </div>
      </template>
    </UiToggle>

    <!-- List -->
    <UiToggle
      v-if="isListShow"
      :storageKey="`${storageKey}-${type}-list`"
      :initStatus="true"
      class="@3xl/main:max-w-md"
    >
      <template #header="{ toggle, isShown }">
        <div class="flex items-center justify-between">
          <UiTitleCollapse :isShown @click="toggle">
            {{ t('stat.config.categories.list.title') }} {{ (!isShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
          </UiTitleCollapse>

          <div
            v-if="isShown"
            class="flex items-center gap-1"
          >
            <UiActionButton
              v-if="statConfig.config.value.catsView === 'list' && !props.isOneCategory && isListGrouped"
              :ariaLabel="$t('base.toggleFolders')"
              @click="toggleAllCategories"
            >
              <Icon
                :name="folderIcon"
                size="20"
              />
            </UiActionButton>

            <StatCategoriesGroupingToggle
              v-if="!props.isOneCategory"
              :isGrouped="isListGrouped"
              @toggle="onToggleListGrouping"
            />
          </div>
        </div>

        <div
          v-if="isShown"
          :class="{
            '@3xl/main:max-w-md': !isListGrouped,
          }"
          class="pt-2"
        >
          <UiToggleControlled
            v-for="item in linesCategories"
            :key="item.id"
            class="group"
            :isShown="isExpanded(item.id)"
          >
            <template #header>
              <div class="-mt-px flex items-stretch justify-between">
                <StatCategoriesLine
                  :isShowParent="props.isOneCategory ? false : !isListGrouped"
                  :stacked="!props.isOneCategory && !isListGrouped"
                  :item="item"
                  :isExpanded="isExpanded(item.id)"
                  isShowChevron
                  :maxCategoryValues="linesMaxValues"
                  :lineWidth="isLines ? 0 : 1"
                  class="grow"
                  @click="onParentClick(item)"
                  @amountClick="emit('clickCategory', item.id)"
                />
              </div>
            </template>

            <!-- Inside -->
            <div
              v-if="isExpanded(item.id) && item.categories?.length"
              class="mt-[-2px] ml-5 -translate-x-px pb-3 pl-3"
            >
              <div class="grid">
                <StatCategoriesLine
                  v-for="itemInside in item.categories"
                  :key="itemInside.id"
                  :isShowParent="!isListGrouped"
                  :item="itemInside"
                  :maxCategoryValues="childrenMaxValues"
                  :lineWidth="isLines ? 0 : 1"
                  class="grow"
                  @click="emit('clickCategory', itemInside.id)"
                  @amountClick="emit('clickCategory', itemInside.id)"
                />
              </div>
            </div>
          </UiToggleControlled>
        </div>
      </template>
    </UiToggle>
  </div>
</template>
