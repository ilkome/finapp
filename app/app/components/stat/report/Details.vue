<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildCategoryViews } from '~/components/stat/categories/categoryViews'
import { statPreservedCategoryScrollTopKey, statVirtualFeedKey } from '~/components/stat/injectionKeys'
import { canStickStatCategories, isStatCategoriesPinned } from '~/components/stat/statFeed'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoriesStickyTop?: number
  ctx: StatReportContext
}>()

const { t } = useI18n()
const { computeTotalForTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const isVirtualFeedHost = inject(statVirtualFeedKey, false)
const categoriesBreakdown = useTemplateRef<HTMLElement>('categoriesBreakdown')
const { height: categoriesHeight } = useElementSize(categoriesBreakdown)
const { height: viewportHeight } = useWindowSize()
const preservedCategoryScrollTop = shallowRef<number | null>(null)
provide(statPreservedCategoryScrollTopKey, preservedCategoryScrollTop)
let preserveScrollTimer: ReturnType<typeof setTimeout> | null = null
const baseCategoryViews = computed(() => buildCategoryViews({
  categoriesItems: categoriesStore.items,
  computeValue: ids => computeTotalForTrnsIds(ids).sum,
  excludedCategoriesIds: props.ctx.statExcludedIds.value,
  trnsIds: props.ctx.selectedTrnsIds.value,
  trnsItems: trnsStore.items ?? {},
}))
const quickCategoryViews = computed(() => props.ctx.filteredCategoriesIds.value.length === 0
  ? baseCategoryViews.value
  : undefined)
const canStickCategories = computed(() =>
  props.categoriesStickyTop !== undefined
  && props.ctx.shouldUseTwoColumnLayout.value
  && canStickStatCategories(props.categoriesStickyTop, categoriesHeight.value, viewportHeight.value),
)

function onSetChildCategoryFilter(categoryId: string) {
  const categories = categoriesBreakdown.value
  if (categories) {
    const style = getComputedStyle(categories)
    preservedCategoryScrollTop.value = isStatCategoriesPinned(
      style.position,
      categories.getBoundingClientRect().top,
      Number.parseFloat(style.top),
    )
      ? document.scrollingElement?.scrollTop ?? 0
      : null
  }

  if (preserveScrollTimer !== null)
    clearTimeout(preserveScrollTimer)
  preserveScrollTimer = setTimeout(() => {
    preservedCategoryScrollTop.value = null
    preserveScrollTimer = null
  }, 1000)
  props.ctx.onSetChildCategoryFilter(categoryId)
}

onBeforeUnmount(() => {
  if (preserveScrollTimer !== null)
    clearTimeout(preserveScrollTimer)
})
</script>

<template>
  <StatCategoriesRoundSection
    v-if="ctx.params.statConfig.config.value.categories.round.isShow && ctx.hasCategoriesData.value && (ctx.selectedTrnsIds.value.length > 0 || ctx.filteredCategoriesIds.value.length > 0)"
    :baseCategoryViews
    :excludedCategoriesIds="ctx.statExcludedIds.value"
    :filteredCategoriesIds="ctx.filteredCategoriesIds.value"
    :isOneCategory="ctx.isOneCategory.value"
    :preCategoriesIds="ctx.params.preCategoriesIds?.value"
    @clickCategory="ctx.onClickCategory"
    @setCategoryFilter="ctx.onSetCategoryFilter"
  />

  <div
    v-if="ctx.selectedTrnsIds.value.length > 0 || (isVirtualFeedHost && ctx.params.statTab.value !== 'split')"
    class="_min-h-dvh grid min-w-0 content-start items-start gap-4"
  >
    <div
      :class="{
        'grid gap-5 @3xl/stat:grid-cols-2 @3xl/stat:gap-6': ctx.shouldUseTwoColumnLayout.value,
      }"
    >
      <div
        v-if="ctx.shouldShowCategoriesBreakdown.value"
        ref="categoriesBreakdown"
        data-stat-categories-breakdown
        class="self-start"
        :class="canStickCategories && '@3xl/stat:sticky'"
        :style="canStickCategories ? { top: `${props.categoriesStickyTop}px` } : undefined"
      >
        <StatCategoriesBreakdown
          :baseCategoryViews="quickCategoryViews"
          :excludedCategoriesIds="ctx.statExcludedIds.value"
          :focusedChildCategoryId="ctx.filteredChildCategoryId.value"
          :focusedCategoryId="ctx.focusedQuickCategoryId.value"
          :isOneCategory="ctx.isOneCategory.value"
          :preCategoriesIds="ctx.params.preCategoriesIds?.value"
          :selectedTrnsIds="ctx.selectedAndQuickFilteredTrnsIds.value"
          :storageKey="ctx.statItemStorageKey.value"
          :type="ctx.params.type.value ?? 'netIncome'"
          @clickCategory="ctx.onClickCategory"
          @openCategory="ctx.onOpenCategory"
          @setChildCategoryFilter="onSetChildCategoryFilter"
          @setCategoryFilter="ctx.onSetCategoryFilter"
        />
      </div>

      <StatTrns
        v-if="ctx.params.statConfig.config.value.trns.isShow"
        :ctx="ctx"
        :isPeriodOneDay="ctx.isPeriodOneDay.value"
        :selectedTrnsIds="ctx.selectedAndFilteredTrnsIds.value"
        :storageKey="ctx.statItemStorageKey.value"
        class="@3xl/stat:order-1"
      />
    </div>
  </div>

  <div v-else class="mx-auto grid w-full max-w-150 content-start justify-items-center gap-4">
    <TrnsNoTrns />

    <CategoriesQuickAdd />
  </div>

  <BottomSheetModal
    v-if="ctx.modalSource.value"
    @closed="ctx.closeModal"
  >
    <UiTitleModal>
      {{ t('trns.title') }} {{ ctx.modalTrnsIds.value.length > 0 ? ctx.modalTrnsIds.value.length : '' }}
    </UiTitleModal>

    <div
      class="bottomSheetContentInside scrollerBlock"
      data-stat-trns-quick-view
    >
      <TrnsList
        :isShowDates="!ctx.isPeriodOneDay.value"
        :isShowGroupSum="!ctx.isPeriodOneDay.value"
        :size="50"
        :trnsIds="ctx.modalTrnsIds.value"
        isShowExpense
        isShowFilterByDesc
        isShowFilterByType
        isShowIncome
        isShowTransfers
        @click="ctx.closeModal"
      />
    </div>
  </BottomSheetModal>
</template>
    :baseCategoryViews
