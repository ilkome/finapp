<script setup lang="ts">
import type { Virtualizer } from '@tanstack/vue-virtual'
import type { ComponentPublicInstance } from 'vue'

import { useWindowVirtualizer } from '@tanstack/vue-virtual'

import type { StatVirtualRow } from '~/components/stat/infinitePeriods'
import type { StatFeedScope } from '~/components/stat/statFeedScope'
import type { StatReportContext } from '~/components/stat/useStatReportContext'

import { resolveStatFeedScrollTop, resolveStatStickyBottom, resolveVisibleStatPeriodOffset, shouldRequestStatHistoryLoad } from '~/components/stat/infinitePeriods'
import { statPreservedCategoryScrollTopKey, statStickyTopKey } from '~/components/stat/injectionKeys'
import { isSameStatFeedScope, normalizeStatFeedScope } from '~/components/stat/statFeedScope'
import { useStatInfinitePeriods } from '~/components/stat/useStatInfinitePeriods'
import { TrnType } from '~/components/trns/types'
import { useTrnsListFilters } from '~/components/trns/useTrnsListFilters'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  ctx: StatReportContext
}>()

const trnsStore = useTrnsStore()
const { t } = useI18n()
const isDev = import.meta.dev
const stickyTop = inject(statStickyTopKey, ref(0))
const preservedCategoryScrollTop = inject(statPreservedCategoryScrollTopKey, shallowRef<number | null>(null))

const candidateIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.ctx.effectiveFilteredCategoriesIds.value,
  sort: true,
  trnsIds: props.ctx.params.trnsIds.value,
  trnsTypes: props.ctx.selectedTypesMapping.value,
}))

const {
  filterBy,
  isAllTrnsWithDesc,
  isShowWithDesc,
  isTrnsWithDesc,
  realTypesCount,
  selectedIds,
  setFilterBy,
  typeFilterItems,
} = useTrnsListFilters({
  ids: candidateIds,
  showExpense: computed(() => true),
  showIncome: computed(() => true),
  showTransfers: computed(() => true),
})

const infinite = useStatInfinitePeriods(props.ctx, {
  filterByTypeIds: selectedIds,
  isEnabled: computed(() => true),
})

const feedHeader = useTemplateRef<HTMLElement>('feedHeader')
const virtualViewport = useTemplateRef<HTMLElement>('virtualViewport')
const scrollMargin = shallowRef(0)
const stickyBottom = shallowRef(0)
const isReconciling = shallowRef(false)
const transactionsCount = computed(() => infinite.rows.value.filter(row => row.type === 'transaction').length)

let activePeriodFrame: number | null = null
let activePeriodScrollDirection: 'backward' | 'forward' | null = null
let lastPageScrollTop = 0
let geometryFrame: number | null = null
let resizeObserver: ResizeObserver | undefined
let isFillingViewport = false
let isResetQueued = false
let isSettlingActivePeriod = false

function estimateRowHeight(index: number) {
  const row = infinite.rows.value[index]
  if (!row)
    return 72
  if (row.type === 'periodAnchor')
    return 1
  if (row.type === 'dateHeader')
    return 48
  if (row.type === 'loader' || row.type === 'end')
    return 44
  const transaction = trnsStore.items?.[row.trnId]
  return transaction?.desc || transaction?.type === TrnType.Transfer ? 88 : 68
}

function onVirtualizerChange(instance: Virtualizer<Window, Element>, sync: boolean) {
  if (!sync || !infinite.canLoadMore.value)
    return

  const terminalIndex = infinite.rows.value.length - 1
  const reachesTerminal = instance.getVirtualItems().some(item => item.index >= terminalIndex - 4)
  if (shouldRequestStatHistoryLoad({
    isFillingViewport,
    isReconciling: isReconciling.value,
    isScrolling: instance.isScrolling,
    reachesTerminal,
    scrollDirection: instance.scrollDirection,
  })) {
    infinite.loadMore('forward-scroll')
  }
}

function getRowKey(index: number) {
  return infinite.rows.value[index]?.id ?? `feed:missing:${index}`
}

const virtualizer = useWindowVirtualizer<Element>(computed(() => ({
  count: infinite.rows.value.length,
  estimateSize: estimateRowHeight,
  getItemKey: getRowKey,
  onChange: onVirtualizerChange,
  overscan: 10,
  scrollMargin: scrollMargin.value,
  scrollPaddingStart: stickyBottom.value,
})))

const virtualRows = computed(() => virtualizer.value.getVirtualItems())

function rowAt(index: number): StatVirtualRow {
  return infinite.rows.value[index] ?? { id: 'feed:missing', type: 'end' }
}

function rowOffset(row: StatVirtualRow) {
  return 'offset' in row ? row.offset : undefined
}

function measureRow(target: Element | ComponentPublicInstance | null) {
  const element = target && '$el' in target ? target.$el : target
  if (element instanceof Element)
    virtualizer.value.measureElement(element)
}

function getStickyBottom() {
  const stickySummary = document.querySelector<HTMLElement>('[data-stat-sticky-summary]')
  if (!stickySummary)
    return stickyTop.value
  const rect = stickySummary.getBoundingClientRect()
  return resolveStatStickyBottom(stickyTop.value, rect.top, rect.bottom)
}

function updateGeometry() {
  geometryFrame = null
  const viewport = virtualViewport.value
  if (!viewport)
    return

  const nextScrollMargin = viewport.getBoundingClientRect().top + window.scrollY
  const nextStickyBottom = getStickyBottom()
  if (Math.abs(scrollMargin.value - nextScrollMargin) > 0.5)
    scrollMargin.value = nextScrollMargin
  if (Math.abs(stickyBottom.value - nextStickyBottom) > 0.5)
    stickyBottom.value = nextStickyBottom
}

function scheduleGeometryUpdate() {
  if (geometryFrame !== null)
    return
  geometryFrame = requestAnimationFrame(updateGeometry)
}

function updateActivePeriod() {
  activePeriodFrame = null
  const scrollDirection = activePeriodScrollDirection
  activePeriodScrollDirection = null
  if (!scrollDirection)
    return

  const currentOffset = props.ctx.params.statDate.scrollRangeOffset.value ?? props.ctx.params.statDate.params.value.rangeOffset
  const nextOffset = resolveVisibleStatPeriodOffset({
    items: virtualizer.value.getVirtualItems(),
    previousOffset: currentOffset,
    rows: infinite.rows.value,
    scrollDirection,
    visibleTop: (virtualizer.value.scrollOffset ?? window.scrollY) + stickyBottom.value,
  })
  if (nextOffset !== currentOffset) {
    isSettlingActivePeriod = true
    infinite.setActiveOffset(nextOffset)
    nextTick(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      lastPageScrollTop = document.scrollingElement?.scrollTop ?? window.scrollY
      isSettlingActivePeriod = false
    })))
  }
}

function onPageScroll() {
  const scrollTop = document.scrollingElement?.scrollTop ?? window.scrollY
  const delta = scrollTop - lastPageScrollTop
  lastPageScrollTop = scrollTop
  if (Math.abs(delta) <= 0.5 || isReconciling.value || isSettlingActivePeriod)
    return

  activePeriodScrollDirection = delta > 0 ? 'forward' : 'backward'
  scheduleActivePeriodUpdate()
}

function scheduleActivePeriodUpdate() {
  if (activePeriodFrame !== null)
    return
  activePeriodFrame = requestAnimationFrame(updateActivePeriod)
}

function nextAnimationFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function settleVirtualMeasurements() {
  await nextTick()
  await nextAnimationFrame()
  await nextAnimationFrame()
}

async function fillViewport() {
  if (isFillingViewport)
    return

  isFillingViewport = true
  let appendedPeriods = 0
  try {
    while (infinite.canLoadMore.value) {
      await settleVirtualMeasurements()
      const viewport = virtualViewport.value
      if (!viewport)
        break
      const hasMeaningfulForwardScroll = viewport.getBoundingClientRect().bottom > window.innerHeight + 2
      if (transactionsCount.value > 0 && hasMeaningfulForwardScroll)
        break

      const result = infinite.loadMore('initial-fill')
      if (result.status !== 'appended')
        break
      appendedPeriods++
      if (isDev && appendedPeriods > 500)
        throw new Error('Statistics feed viewport fill exceeded 500 appended periods')
    }
  }
  finally {
    isFillingViewport = false
    scheduleGeometryUpdate()
  }
}

function observeGeometry() {
  if (resizeObserver)
    return
  resizeObserver = new ResizeObserver(scheduleGeometryUpdate)
  if (feedHeader.value)
    resizeObserver.observe(feedHeader.value)
  const summary = document.querySelector<HTMLElement>('[data-stat-sticky-summary]')
  if (summary)
    resizeObserver.observe(summary)
  lastPageScrollTop = document.scrollingElement?.scrollTop ?? window.scrollY
  window.addEventListener('scroll', onPageScroll, { passive: true })
  window.addEventListener('resize', scheduleGeometryUpdate, { passive: true })
}

function stopObservingGeometry() {
  resizeObserver?.disconnect()
  resizeObserver = undefined
  window.removeEventListener('scroll', onPageScroll)
  window.removeEventListener('resize', scheduleGeometryUpdate)
  if (activePeriodFrame !== null) {
    cancelAnimationFrame(activePeriodFrame)
    activePeriodFrame = null
  }
  if (geometryFrame !== null) {
    cancelAnimationFrame(geometryFrame)
    geometryFrame = null
  }
}

async function resetFeed() {
  if (isReconciling.value) {
    isResetQueued = true
    return
  }
  isReconciling.value = true
  const scroller = document.scrollingElement
  const landingScrollTop = resolveStatFeedScrollTop(
    preservedCategoryScrollTop.value,
    scroller?.scrollTop ?? 0,
    false,
  ) ?? 0

  try {
    activePeriodScrollDirection = null
    isSettlingActivePeriod = false
    infinite.reset()
    await nextTick()
    updateGeometry()
    if (scroller && Math.abs(scroller.scrollTop - landingScrollTop) > 0.5)
      window.scrollTo({ top: landingScrollTop })
    await fillViewport()
    await settleVirtualMeasurements()
  }
  finally {
    isReconciling.value = false
    if (isResetQueued) {
      isResetQueued = false
      void resetFeed()
    }
  }
}

const reportScope = computed<StatFeedScope>(() => ({
  childCategoryId: props.ctx.filteredChildCategoryId.value,
  date: {
    customDate: props.ctx.params.statDate.params.value.customDate,
    granularityBy: props.ctx.params.statDate.params.value.granularityBy,
    granularityDuration: props.ctx.params.statDate.params.value.granularityDuration,
    isShowMaxRange: props.ctx.params.statDate.params.value.isShowMaxRange,
    isSkipEmpty: props.ctx.params.statDate.params.value.isSkipEmpty,
    rangeBy: props.ctx.params.statDate.params.value.rangeBy,
    rangeDuration: props.ctx.params.statDate.params.value.rangeDuration,
    rangeOffset: props.ctx.params.statDate.params.value.rangeOffset,
  },
  filteredType: props.ctx.filteredType.value,
  parentCategoriesIds: props.ctx.filteredCategoriesIds.value,
  selectedCategoriesIds: props.ctx.params.filter.categoriesIds.value,
  selectedWalletsIds: props.ctx.params.filter.walletsIds.value,
  statTab: props.ctx.params.statTab.value,
}))

let previousReportScope = normalizeStatFeedScope(reportScope.value)
watch(reportScope, (scope) => {
  if (!isSameStatFeedScope(previousReportScope, scope))
    void resetFeed()
  previousReportScope = normalizeStatFeedScope(scope)
}, { deep: true })
watch(() => props.ctx.params.statDate.scrollRangeResetVersion.value, () => {
  void resetFeed()
})
watch(infinite.rows, () => nextTick(scheduleGeometryUpdate))

onMounted(() => {
  observeGeometry()
  nextTick(async () => {
    updateGeometry()
    await fillViewport()
  })
})

onActivated(() => {
  observeGeometry()
  nextTick(async () => {
    updateGeometry()
    await fillViewport()
  })
})

onDeactivated(stopObservingGeometry)
onBeforeUnmount(stopObservingGeometry)
</script>

<template>
  <div
    class="min-w-0"
    :data-stat-loaded-offsets="isDev ? JSON.stringify(infinite.loadedOffsets.value) : undefined"
    :data-stat-load-count="isDev ? infinite.loadRequestCount.value : undefined"
    :data-stat-load-reason="isDev ? infinite.lastLoadReason.value : undefined"
    :data-stat-searched-through-offset="isDev ? infinite.searchedThroughOffset.value : undefined"
    :data-stat-total-size="isDev ? Math.round(virtualizer.getTotalSize()) : undefined"
  >
    <div ref="feedHeader">
      <TrnsListFilterControls
        :filterBy
        :isAllTrnsWithDesc
        :isShowFilterByDesc="true"
        :isShowFilterByType="true"
        :isShowWithDesc
        :isTrnsWithDesc
        :realTypesCount
        :selectedCount="selectedIds.length"
        :typeFilterItems
        @setFilterBy="setFilterBy"
        @update:isShowWithDesc="isShowWithDesc = $event"
      />
    </div>

    <div
      ref="virtualViewport"
      class="stat-trns-virtual relative pr-1"
      :style="{ height: `${virtualizer.getTotalSize()}px` }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        :ref="measureRow"
        :data-index="virtualRow.index"
        :data-stat-offset="rowOffset(rowAt(virtualRow.index))"
        :data-stat-row-key="isDev ? String(virtualRow.key) : undefined"
        :data-stat-row-size="isDev ? Math.round(virtualRow.size) : undefined"
        class="absolute top-0 left-0 w-full"
        :style="{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }"
      >
        <template v-for="row in [rowAt(virtualRow.index)]" :key="row.id">
          <div
            v-if="row.type === 'periodAnchor'"
            aria-hidden="true"
            class="h-px"
          />

          <TrnsListRow
            v-else-if="row.type === 'dateHeader' || row.type === 'transaction'"
            :isShowGroupSum="true"
            :row
          />

          <div
            v-else-if="row.type === 'loader' && infinite.canLoadMore.value"
            class="px-2 py-1"
          >
            <button
              type="button"
              class="flex-center w-full rounded-sm bg-elevated px-5 py-2 text-sm text-muted hover:bg-accented"
              @click="infinite.loadMore('manual')"
            >
              {{ t('trns.more') }}
            </button>
          </div>

          <TrnsNoTrns
            v-else-if="row.type === 'end' && transactionsCount === 0 && !infinite.isBasePeriodEmpty.value"
          />
        </template>
      </div>
    </div>
  </div>
</template>
