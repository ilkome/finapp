<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useStatCategories } from '~/components/stat/categories/useStatCategories'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  excludedCategoriesIds?: ReadonlySet<CategoryId>
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
const statConfig = inject(statConfigKey)!

// Config
const catsList = computed(() => statConfig.config.value.catsList)
const isVerticalShow = computed(() => statConfig.config.value.vertical.isShow)
const isVerticalGrouped = computed(() => statConfig.config.value.vertical.isGrouped)
const isListShow = computed(() => catsList.value.isShow)
const isListGrouped = computed(() => catsList.value.isGrouped)
const isLines = computed(() => catsList.value.isLines)

// Categories data (lazy — each variant computed only when accessed)
const groupedCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], true, undefined, props.excludedCategoriesIds))
const ungroupedCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], false, undefined, props.excludedCategoriesIds))

const categoriesWithData = computed<CategoryWithData[]>(() => {
  const isGrouped = statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped

  if (statConfig.config.value.isShowEmptyCategories && props.preCategoriesIds?.length)
    return computeCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped, props.preCategoriesIds, props.excludedCategoriesIds)

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
  computed(() => categoriesWithData.value.map(c => c.id)),
)

function onParentClick(item: CategoryWithData) {
  if (item.categories?.length)
    toggleCategory(item.id)
  else
    emit('clickCategory', item.id)
}

function onToggleListGrouping() {
  statConfig.updateConfig('catsList', { isGrouped: !isListGrouped.value })
}

const isVerticalShown = useStoredToggle(`${props.storageKey}-${props.type}-vertical`, true)
const isListShown = useStoredToggle(`${props.storageKey}-${props.type}-list`, true)
</script>

<template>
  <div
    v-if="categoriesWithData.length > 0"
    class="grid content-start gap-3 @3xl/main:max-w-lg"
  >
    <!-- Vertical -->
    <div v-if="isVerticalShow">
      <div class="flex items-center justify-between">
        <UiTitleCollapse
          class="grow"
          :isShown="isVerticalShown"
          @click="isVerticalShown = !isVerticalShown"
        >
          {{ t('stat.config.categories.vertical.title') }} {{ (!isVerticalShown && visibleVerticalCategories.length > 0) ? visibleVerticalCategories.length : '' }}
        </UiTitleCollapse>

        <div
          v-if="isVerticalShown && !props.isOneCategory"
          class="flex items-center"
        >
          <StatCategoriesGroupingToggle
            :isGrouped="isVerticalGrouped"
            @toggle="statConfig.config.value.vertical.isGrouped = !isVerticalGrouped"
          />
        </div>
      </div>

      <div
        v-if="isVerticalShown"
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
    </div>

    <!-- List -->
    <div
      v-if="isListShow"
      class="@3xl/main:max-w-md"
    >
      <div class="flex items-center justify-between">
        <UiTitleCollapse
          class="grow"
          :isShown="isListShown"
          @click="isListShown = !isListShown"
        >
          {{ t('stat.config.categories.list.title') }} {{ (!isListShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
        </UiTitleCollapse>

        <div
          v-if="isListShown"
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
        v-if="isListShown"
        :class="{
          '@3xl/main:max-w-md': !isListGrouped,
        }"
        class="pt-2"
      >
        <UCollapsible
          v-for="item in linesCategories"
          :key="item.id"
          :open="isExpanded(item.id)"
          class="group"
        >
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

          <template #content>
            <!-- Inside -->
            <div
              v-if="item.categories?.length"
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
          </template>
        </UCollapsible>
      </div>
    </div>
  </div>
</template>
