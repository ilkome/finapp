<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey, statDateKey, statStickyNavKey } from '~/components/stat/injectionKeys'
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

// Mobile chart reveal over the zone [page top .. header pin]:
//  - fade: the chart fades + lifts as it scrolls out through the top (GSAP scrub, both ways).
//  - snap: once the native scroll fully settles (finger up + momentum dead) inside the zone, one
//    native smooth-scroll commits to chart-shown (0) or docked (pin). This is how T-Bank's mobile
//    web stays glassy: it never writes scrollTop while the fling is live, so nothing races it.
//    Our earlier per-frame rAF tween easing scrollTop against the iOS fling was the jitter.
const chartTrigger = ref<HTMLElement | null>(null)
const chartFx = ref<HTMLElement | null>(null)
const dateFx = ref<HTMLElement | null>(null)
const sumsFx = ref<HTMLElement | null>(null)
if (stickyNav && import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
  const mm = gsap.matchMedia()
  onMounted(() => {
    mm.add('(max-width: 767px)', () => {
      const trigger = chartTrigger.value
      const fx = chartFx.value
      if (!trigger || !fx)
        return

      const scroller = document.scrollingElement as HTMLElement

      // document offset of the chart's bottom = where the sticky header pins.
      const pinAt = () => {
        let y = trigger.offsetHeight
        for (let n: HTMLElement | null = trigger; n; n = n.offsetParent as HTMLElement | null)
          y += n.offsetTop
        return Math.round(y)
      }

      ScrollTrigger.create({
        animation: gsap.to(fx, { ease: 'none', opacity: 0, yPercent: -30 }),
        end: pinAt,
        scrub: true,
        start: 0,
      })

      // Date + sums lift faster than the scroll, then ease back to their standard position by the
      // time they pin - so they dock cleanly, not left floating high. The sums lift a little less
      // than the date, so the two read as layers.
      const liftToPin = (el: HTMLElement, lift: number) => {
        const tl = gsap.timeline()
          .to(el, { duration: 0.55, ease: 'sine.out', yPercent: -lift })
          .to(el, { duration: 0.45, ease: 'sine.inOut', yPercent: 0 })
        return ScrollTrigger.create({ animation: tl, end: pinAt, scrub: true, start: 0 })
      }
      if (dateFx.value)
        liftToPin(dateFx.value, 16)
      if (sumsFx.value)
        liftToPin(sumsFx.value, 12)

      // Native snap: fire only after the scroll goes idle (finger up + momentum dead), then let
      // the browser own the animation. `touching` blocks any snap while a finger is down; the
      // debounce fires ~100ms after the last scroll event, i.e. once the iOS fling has died.
      let touching = false
      let lastY = scroller.scrollTop
      let dir = 0
      let idle: ReturnType<typeof setTimeout> | undefined
      const settle = () => {
        if (touching)
          return
        const pin = pinAt()
        const y = scroller.scrollTop
        if (y <= 2 || y >= pin - 2)
          return // already at a rest point, or scrolled past the zone into the list
        // Commit in the LAST direction the finger moved, so "up, then down" ends up docking. Any
        // amount of drag commits - resting half-open was the complaint - so there's no distance
        // threshold; the nearest edge is only a fallback if no direction was ever registered.
        const target = dir > 0 ? pin : dir < 0 ? 0 : (y < pin / 2 ? 0 : pin)
        window.scrollTo({ behavior: 'smooth', top: target })
      }
      const schedule = () => {
        const y = scroller.scrollTop
        if (y !== lastY)
          dir = y > lastY ? 1 : -1
        lastY = y
        clearTimeout(idle)
        idle = setTimeout(settle, 100)
      }
      const onTouchStart = () => {
        touching = true
        clearTimeout(idle)
      }
      const onTouchEnd = () => {
        // A still finger lifting sends no scroll event, so kick the settle here too - otherwise a
        // slow drag-and-hold would rest half-open.
        touching = false
        schedule()
      }
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchend', onTouchEnd, { passive: true })

      return () => {
        clearTimeout(idle)
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchend', onTouchEnd)
      }
    })
  })
  onUnmounted(() => mm.revert())
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
            @clickAverage="statConfig.updateConfig('statAverage', { isShow: !isShowAverage })"
          />
        </div>
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
