<script setup lang="ts">
import type { StatReportBlockId } from '~/components/stat/config/schema'
import type { StatReportContext } from '~/components/stat/report/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildCategoryViews, collectRoundCategoryIds } from '~/components/stat/categories/categoryViews'
import { statPreservedCategoryScrollTopKey, statVirtualFeedKey } from '~/components/stat/injectionKeys'
import { canStickStatCategories, isStatCategoriesPinned } from '~/components/stat/statFeed'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  block: StatReportBlockId
  categoriesStickyTop?: number
  ctx: StatReportContext
  isTwoColumnLayout?: boolean
  managedLayout?: boolean
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
const isTwoColumnLayout = computed(() => props.isTwoColumnLayout ?? props.ctx.shouldUseTwoColumnLayout.value)
const baseCategoryViews = computed(() => buildCategoryViews({
  categoriesItems: categoriesStore.items,
  computeValue: ids => computeTotalForTrnsIds(ids).net,
  excludedCategoriesIds: props.ctx.statExcludedIds.value,
  intervals: props.ctx.effectiveIntervals.value,
  trnsIds: props.ctx.selectedTrnsIds.value,
  trnsItems: trnsStore.items ?? {},
}))
const quickCategoryViews = computed(() => props.ctx.filteredCategoriesIds.value.length === 0
  ? baseCategoryViews.value
  : undefined)
const roundCategoryIds = computed(() => collectRoundCategoryIds({
  favoriteCategoryIds: categoriesStore.favoriteCategoriesIds,
  filteredCategoryIds: props.ctx.filteredCategoriesIds.value,
  isShowFavorites: props.ctx.params.statConfig.config.value.categories.round.isShowFavorites,
  isShowRecent: props.ctx.params.statConfig.config.value.categories.round.isShowRecent,
  preCategoryIds: props.ctx.params.preCategoriesIds?.value,
  recentCategoryIds: categoriesStore.recentCategoriesIds,
}))
const canStickCategories = computed(() =>
  props.categoriesStickyTop !== undefined
  && isTwoColumnLayout.value
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
    v-if="props.block === 'catsRound' && ctx.params.statConfig.config.value.categories.round.isShow && ctx.hasCategoriesData.value && (ctx.selectedTrnsIds.value.length > 0 || roundCategoryIds.length > 0)"
    :baseCategoryViews
    :excludedCategoriesIds="ctx.statExcludedIds.value"
    :filteredCategoriesIds="ctx.filteredCategoriesIds.value"
    :focusedCategoryId="ctx.filteredParentCategoryId.value"
    :isOneCategory="ctx.isOneCategory.value"
    :preCategoriesIds="ctx.params.preCategoriesIds?.value"
    @clickCategory="ctx.onClickCategory"
    @setCategoryFilter="ctx.onSetCategoryFilter"
  />

  <div
    v-if="props.block !== 'catsRound' && (ctx.selectedTrnsIds.value.length > 0 || (isVirtualFeedHost && ctx.params.reportType.value === 'combined'))"
    class="_min-h-dvh grid min-w-0 content-start items-start gap-4"
  >
    <div
      :class="{
        'stat-responsive-two-column-grid': isTwoColumnLayout && !props.managedLayout,
      }"
    >
      <div
        v-if="(props.block === 'catsList' || props.block === 'vertical') && ctx.shouldShowCategoriesBreakdown.value"
        ref="categoriesBreakdown"
        data-stat-categories-breakdown
        class="self-start"
        :class="canStickCategories && '@3xl/stat:sticky'"
        :style="canStickCategories ? { top: `${props.categoriesStickyTop}px` } : undefined"
      >
        <StatCategoriesBreakdown
          :baseCategoryViews="quickCategoryViews"
          :block="props.block"
          :excludedCategoriesIds="ctx.statExcludedIds.value"
          :focusedChildCategoryId="ctx.filteredChildCategoryId.value"
          :focusedCategoryId="ctx.focusedQuickCategoryId.value"
          :isOneCategory="ctx.isOneCategory.value"
          :isTwoColumnLayout="isTwoColumnLayout"
          :preCategoriesIds="ctx.params.preCategoriesIds?.value"
          :selectedTrnsIds="ctx.selectedAndQuickFilteredTrnsIds.value"
          :storageKey="ctx.statItemStorageKey.value"
          :type="ctx.params.type.value ?? 'net'"
          @clickCategory="ctx.onClickCategory"
          @openCategory="ctx.onOpenCategory"
          @setChildCategoryFilter="onSetChildCategoryFilter"
          @setCategoryFilter="ctx.onSetCategoryFilter"
        />
      </div>

      <StatTrns
        v-if="props.block === 'trns' && ctx.params.statConfig.config.value.trns.isShow"
        :ctx="ctx"
        :isPeriodOneDay="ctx.isPeriodOneDay.value"
        :selectedTrnsIds="ctx.selectedAndFilteredTrnsIds.value"
        :storageKey="ctx.statItemStorageKey.value"
        class="@3xl/stat:order-1"
      />
    </div>
  </div>

  <div v-else-if="props.block === 'trns'" class="mx-auto grid w-full max-w-150 content-start justify-items-center gap-4">
    <TrnsNoTrns />

    <CategoriesQuickAdd />
  </div>

  <BottomSheetModal
    v-if="props.block === 'trns' && ctx.modalSource.value"
    @closed="ctx.closeModal"
  >
    <UiTitleModal v-if="ctx.modalTrnsIds.value.length > 0">
      {{ t('trns.title') }} {{ ctx.modalTrnsIds.value.length }}
    </UiTitleModal>

    <div
      class="bottom-sheet-content-inside scroller-block"
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
