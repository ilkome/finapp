<script setup lang="ts">
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey, statConfigKey, statDateKey, statStickyNavKey } from '~/components/stat/injectionKeys'
import { useStatItem } from '~/components/stat/useStatItem'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

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
const trnsStore = useTrnsStore()

// Mobile: the first downward swipe from the very top eased-scrolls past the chart to the
// categories block (GSAP). Scrolling back up is free - the chart just reappears, no gated
// animation (autoKill drops the tween the instant the user scrolls the other way).
const headerRef = ref<HTMLElement | null>(null)
if (stickyNav && import.meta.client) {
  gsap.registerPlugin(ScrollToPlugin)
  // pinAt = document offset where the sticky header pins (i.e. chart fully scrolled away).
  function pinOffset(el: HTMLElement) {
    let y = 0
    for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null)
      y += n.offsetTop
    return Math.round(y)
  }

  let prevY = 0
  let animating = false
  function onScroll() {
    const header = headerRef.value
    const y = window.scrollY
    if (animating || !header || window.innerWidth > 767) {
      prevY = y
      return
    }
    const fromTop = prevY <= 4
    const goingDown = y > prevY
    prevY = y
    const pinAt = pinOffset(header)
    if (fromTop && goingDown && y > 4 && y < pinAt) {
      animating = true
      const done = () => {
        animating = false
        prevY = window.scrollY
      }
      gsap.to(window, {
        duration: 0.3,
        ease: 'power3.out',
        onComplete: done,
        onInterrupt: done,
        scrollTo: { autoKill: true, y: pinAt },
      })
    }
  }
  onMounted(() => {
    prevY = window.scrollY
    document.addEventListener('scroll', onScroll, { passive: true })
  })
  onUnmounted(() => document.removeEventListener('scroll', onScroll))
}

const isOneCategory = computed(() => !!props.categoryId)
const shouldShowAmounts = computed(() => !props.categoryId || props.categoryId !== 'transfer')
const isRoundShow = computed(() => statConfig.config.value.catsRound.isShow)
const isListShow = computed(() => statConfig.config.value.catsList.isShow)
const isVerticalShow = computed(() => statConfig.config.value.vertical.isShow)
const isShowAverage = computed(() => statConfig.config.value.statAverage.isShow)
const isTrnsShow = computed(() => statConfig.config.value.trns.isShow)

const {
  averageTotal,
  chartPieGroups,
  chartSeries,
  chartXAxisLabels,
  filteredCategoriesIds,
  filteredType,
  forecastMode,
  forecastRangeTotal,
  isPeriodOneDay,
  onClickSumItem,
  onSetCategoryFilter,
  rangeTotal,
  selectedAndFilteredTrnsIds,
  selectedTrnsIds,
  selectedTypeForSum,
  statExcludedIds,
  statItemStorageKey,
} = useStatItem({
  // Exclude flagged categories only on the default aggregate: not on a single-category
  // page, and not when the top filter already narrows to categories.
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  filter,
  statConfig,
  statDate,
  statTab: computed(() => props.statTab),
  storageKey: computed(() => props.storageKey),
  trnsIds: computed(() => props.trnsIds),
  type: computed(() => props.type),
})

const hasCategoriesData = computed(() => props.hasChildren || (props.preCategoriesIds ?? []).length > 0)
const shouldUseTwoColumnLayout = computed(() => props.statTab !== 'split' && isListShow.value)

// Modal state: 'quickView' shows snapshot trnsIds, 'fullTrns' shows reactive selectedAndFilteredTrnsIds
const modalSource = ref<'fullTrns' | 'quickView' | null>(null)
const quickViewTrnsIds = ref<TrnId[]>([])
const modalTrnsIds = computed(() => {
  if (modalSource.value === 'quickView')
    return quickViewTrnsIds.value
  if (modalSource.value === 'fullTrns')
    return selectedAndFilteredTrnsIds.value
  return []
})

function closeModal() {
  modalSource.value = null
  quickViewTrnsIds.value = []
}

function onClickCategory(clickedCategoryId: CategoryId) {
  if (props.categoryId) {
    filter.setCategoryId(clickedCategoryId)

    const baseParams = {
      filterCategories: filter.categoriesIds.value.join(','),
      filterWallets: props.walletId ? props.walletId : filter.walletsIds.value.join(','),
      storageKey: props.storageKey ?? '',
    }

    const queryParams = new URLSearchParams({ ...baseParams }).toString()
    return useRouter().push(`/categories/${clickedCategoryId}?${queryParams}`)
  }

  quickViewTrnsIds.value = trnsStore.getStoreTrnsIds({
    categoriesIds: [clickedCategoryId],
    sort: true,
    trnsIds: selectedAndFilteredTrnsIds.value,
  })
  modalSource.value = 'quickView'
}

function onClickSumItemWrap(type: SeriesSlugSelected) {
  if (type === 'netIncome')
    modalSource.value = 'fullTrns'

  onClickSumItem(type)
}
</script>

<template>
  <div class="@container/stat">
    <StatChartWrap
      v-if="shouldShowAmounts"
      :pieGroups="chartPieGroups"
      :series="chartSeries"
      :xAxisLabels="chartXAxisLabels"
      class="pb-3"
      @clickCategory="onSetCategoryFilter"
    />

    <div class="grid min-w-0 content-start gap-3">
      <div
        ref="headerRef"
        class="grid gap-3"
        :class="stickyNav && 'bg-default/90 sticky top-0 z-10 -mx-2 px-2 pb-2 backdrop-blur lg:-mx-4 lg:px-4'"
      >
        <StatDateNavigation>
          <StatFilterButton />
          <StatFilterSelected
            v-if="filter.isShow.value"
            isShowCategories
            isShowWallets
          />
        </StatDateNavigation>

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
          @clickAverage="statConfig.updateConfig('statAverage', { isShow: !isShowAverage })"
        />
      </div>

      <StatCategoriesRoundSection
        v-if="isRoundShow && hasCategoriesData && (selectedTrnsIds.length > 0 || filteredCategoriesIds.length > 0)"
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
          <StatCategoriesDetailedSection
            v-if="(isListShow || isVerticalShow) && hasCategoriesData"
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
            v-if="isTrnsShow"
            :isPeriodOneDay="isPeriodOneDay"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="statItemStorageKey"
            class="@3xl/stat:order-1"
          />
        </div>
      </div>

      <div v-else class="mx-auto grid w-full max-w-150 content-start justify-items-center gap-4">
        <TrnsNoTrns />

        <StatCategoriesRoundRecent />
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
