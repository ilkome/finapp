<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey, statDateKey, statStickyNavKey } from '~/components/stat/injectionKeys'
import { useScrollReveal } from '~/components/stat/useScrollReveal'
import { useStatReportContext } from '~/components/stat/useStatReportContext'

const props = defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  statTab: StatTabSlug
  storageKey: string
  trnsIds: TrnId[]
  type?: SeriesSlugSelected
  walletId?: WalletId
}>()

const { t } = useI18n()
const filter = inject(filterKey)!
const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
// Dashboard pins the nav row + sum tiles to the top with the header's background.
const stickyNav = inject(statStickyNavKey, false)

const { chartFx, chartTrigger, dateFx, sumsFx } = useScrollReveal(stickyNav)

const {
  averageTotal,
  chartPieGroups,
  chartSeries,
  chartXAxisLabels,
  closeModal,
  filteredCategoriesIds,
  filteredType,
  forecastMode,
  forecastRangeTotal,
  hasCategoriesData,
  isOneCategory,
  isPeriodOneDay,
  modalSource,
  modalTrnsIds,
  onClickCategory,
  onClickSumItemWrap,
  onSetCategoryFilter,
  rangeTotal,
  selectedAndFilteredTrnsIds,
  selectedTrnsIds,
  selectedTypeForSum,
  shouldShowAmounts,
  shouldUseTwoColumnLayout,
  statExcludedIds,
  statItemStorageKey,
} = useStatReportContext({
  // Exclude flagged categories only on the default aggregate: not on a single-category
  // page, and not when the top filter already narrows to categories.
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
  preCategoriesIds: computed(() => props.preCategoriesIds),
  statConfig,
  statDate,
  statTab: computed(() => props.statTab),
  storageKey: computed(() => props.storageKey),
  trnsIds: computed(() => props.trnsIds),
  type: computed(() => props.type),
  walletId: computed(() => props.walletId),
})
</script>

<template>
  <div class="@container/stat">
    <div ref="chartTrigger">
      <div ref="chartFx">
        <StatChartWrap
          v-if="shouldShowAmounts"
          :pieGroups="chartPieGroups"
          :series="chartSeries"
          :xAxisLabels="chartXAxisLabels"
          class="pb-3"
          @clickCategory="onSetCategoryFilter"
        />
      </div>
    </div>

    <div class="grid min-w-0 content-start gap-3">
      <div
        class="grid gap-3"
        :class="stickyNav && 'bg-default/90 sticky top-0 z-10 -mx-2 px-2 backdrop-blur lg:-mx-4 lg:px-4 lg:pb-2'"
      >
        <div ref="dateFx" class="min-w-0">
          <StatDateNavigation>
            <FilterButton />
            <FilterSelected
              v-if="filter.isShow.value"
              isShowCategories
              isShowWallets
            />
          </StatDateNavigation>
        </div>

        <div ref="sumsFx" class="min-w-0">
          <StatSumWrap
            v-if="shouldShowAmounts"
            :averageTotal
            :categoryId="props.categoryId"
            :filteredType="filteredType"
            :forecastMode="forecastMode"
            :forecastTotal="forecastRangeTotal"
            :total="rangeTotal"
            :trnsIds
            :type="selectedTypeForSum"
            :walletId
            @click="onClickSumItemWrap"
            @clickAverage="statConfig.updateConfig('average', { isShow: !statConfig.config.value.average.isShow })"
          />
        </div>
      </div>

      <StatCategoriesRoundSection
        v-if="statConfig.config.value.categories.round.isShow && hasCategoriesData && (selectedTrnsIds.length > 0 || filteredCategoriesIds.length > 0)"
        :excludedCategoriesIds="statExcludedIds"
        :filteredCategoriesIds
        :isOneCategory="isOneCategory"
        :preCategoriesIds="props.preCategoriesIds"
        :selectedTrnsIds
        @clickCategory="onClickCategory"
        @setCategoryFilter="onSetCategoryFilter"
      />

      <div
        v-if="selectedTrnsIds.length > 0"
        class="_min-h-dvh grid min-w-0 content-start items-start gap-4"
      >
        <div
          :class="{
            'grid gap-5 @3xl/stat:grid-cols-2 @3xl/stat:gap-6': shouldUseTwoColumnLayout,
          }"
        >
          <StatCategoriesBreakdown
            v-if="(statConfig.config.value.categories.list.isShow || statConfig.config.value.categories.bars.isShow) && hasCategoriesData"
            :excludedCategoriesIds="statExcludedIds"
            :isOneCategory="isOneCategory"
            :preCategoriesIds="props.preCategoriesIds"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="statItemStorageKey"
            :type="props.type ?? 'netIncome'"
            @clickCategory="onClickCategory"
            @setCategoryFilter="onSetCategoryFilter"
          />

          <StatTrns
            v-if="statConfig.config.value.trns.isShow"
            :isPeriodOneDay="isPeriodOneDay"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="statItemStorageKey"
            class="@3xl/stat:order-1"
          />
        </div>
      </div>

      <div v-else class="mx-auto grid w-full max-w-150 content-start justify-items-center gap-4">
        <TrnsNoTrns />

        <CategoriesQuickAdd />
      </div>
    </div>

    <BottomSheetModal
      v-if="modalSource"
      @closed="closeModal"
    >
      <UiTitleModal>
        {{ t('trns.title') }} {{ modalTrnsIds.length > 0 ? modalTrnsIds.length : '' }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock">
        <TrnsList
          :isShowDates="!isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :size="50"
          :trnsIds="modalTrnsIds"
          isShowExpense
          isShowFilterByDesc
          isShowFilterByType
          isShowIncome
          isShowTransfers
        />
      </div>
    </BottomSheetModal>
  </div>
</template>
