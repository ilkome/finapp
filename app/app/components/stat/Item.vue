<script setup lang="ts">
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

// Mobile chart reveal, scrubbed to the document scroll over the zone [page top .. header pin]:
//  - fade: the chart fades + lifts as it scrolls out through the top (scrub, both ways),
//    starting the instant you scroll from the very top.
//  - snap: on finger-lift (touchend - a drag fires pointercancel, not pointerup) our own tween
//    finishes the gesture: down docks the categories, up reveals the chart to the top; an
//    up-fling from the categories that coasts in is finished to the top too. We avoid GSAP's
//    ScrollTrigger snap on purpose - going up it eases scrollTop against the still-running native
//    fling (two writers per frame), and that fight is the jitter still being chased.
const chartTrigger = ref<HTMLElement | null>(null)
const chartFx = ref<HTMLElement | null>(null)
if (stickyNav && import.meta.client) {
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  // iOS sheet / scroll-deceleration curve: fast start, long soft settle.
  CustomEase.create('apple', 'M0,0 C0.32,0.72 0,1 1,1')
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

      // Chart fade + lift as it scrolls out through the top (scrub, both ways).
      ScrollTrigger.create({
        animation: gsap.to(fx, { ease: 'none', opacity: 0, yPercent: -30 }),
        end: pinAt,
        scrub: true,
        start: 0,
      })

      // Snapping is driven entirely by our own tweens (see block comment above) - never GSAP's
      // ScrollTrigger snap, which fights the native fling and jitters.
      let dir = 0
      let prevY = scroller.scrollTop
      let touching = false
      let startedInZone = false
      let taken = false // this gesture's scroll has been handed to a snap tween

      // Duration tracks distance (~constant velocity) so a short snap stays quick, not sluggish.
      const snapTo = (target: number) => {
        taken = true
        gsap.to(scroller, {
          duration: gsap.utils.clamp(0.3, 0.45, Math.abs(target - scroller.scrollTop) / 800),
          ease: 'apple',
          overwrite: true,
          scrollTop: target,
        })
      }
      const onScroll = () => {
        const y = scroller.scrollTop
        if (y !== prevY)
          dir = y > prevY ? 1 : -1
        prevY = y
        // Up-fling from the categories coasting into the reveal zone: finish it to the top in one
        // motion (with the momentum, nothing to fight) so it locks there instead of drifting.
        if (!touching && !taken && !startedInZone && dir < 0 && y > 0 && y < pinAt())
          snapTo(0)
      }
      // A fresh touch reclaims control mid-snap; remember whether it began inside the zone.
      const onTouchStart = () => {
        dir = 0
        taken = false
        touching = true
        gsap.killTweensOf(scroller)
        startedInZone = scroller.scrollTop <= pinAt() + 1
      }
      const onTouchEnd = () => {
        touching = false
        const pin = pinAt()
        const y = scroller.scrollTop
        if (y <= 0 || y >= pin)
          return
        // Inside the zone on release: finish the way the finger was going - down docks the
        // categories, up reveals the chart and locks at the very top.
        snapTo(dir > 0 ? pin : 0)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchend', onTouchEnd, { passive: true })

      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchend', onTouchEnd)
        gsap.killTweensOf(scroller)
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
