<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/useStatReportContext'

import { useStatInfinitePeriods } from '~/components/stat/useStatInfinitePeriods'
import { TrnType } from '~/components/trns/types'
import { useTrnsListFilters } from '~/components/trns/useTrnsListFilters'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  ctx: StatReportContext
}>()

const trnsStore = useTrnsStore()
const { t } = useI18n()

const candidateIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.ctx.filteredCategoriesIds.value,
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
  const trn = trnsStore.items?.[row.trnId]
  return trn?.desc || trn?.type === TrnType.Transfer ? 84 : 64
}

const virtualViewport = useTemplateRef<HTMLElement>('virtualViewport')
const visibleRange = shallowRef({ end: 20, start: 0 })
const rowOffsets = computed(() => {
  let top = 0
  return infinite.rows.value.map((_, index) => {
    const height = estimateRowHeight(index)
    const metric = { bottom: top + height, top }
    top += height
    return metric
  })
})
const totalEstimatedHeight = computed(() => rowOffsets.value.at(-1)?.bottom ?? 0)
const virtualOffset = computed(() => rowOffsets.value[visibleRange.value.start]?.top ?? 0)
const virtualRows = computed(() => infinite.rows.value
  .slice(visibleRange.value.start, visibleRange.value.end)
  .map((data, index) => ({ data, index: visibleRange.value.start + index })))

const transactionsCount = computed(() => infinite.rows.value.filter(row => row.type === 'transaction').length)

let scrollFrame: number | null = null
let isFillingViewport = false
let previousScrollTop = 0

function getStickyBottom() {
  const stickySummary = document.querySelector<HTMLElement>('[data-stat-sticky-summary]')
  if (!stickySummary)
    return 0
  const rect = stickySummary.getBoundingClientRect()
  return rect.top <= 0 ? rect.bottom : 0
}

function syncVirtualList() {
  scrollFrame = null

  const scroller = document.scrollingElement
  const viewport = virtualViewport.value
  if (!scroller || !viewport)
    return

  const stickyBottom = getStickyBottom()
  const viewportTop = viewport.getBoundingClientRect().top + scroller.scrollTop
  const visibleTop = Math.max(0, scroller.scrollTop + stickyBottom - viewportTop)
  const visibleBottom = visibleTop + window.innerHeight - stickyBottom
  const overscan = 800
  const startIndex = rowOffsets.value.findIndex(metric => metric.bottom >= visibleTop - overscan)
  const start = startIndex === -1 ? Math.max(0, infinite.rows.value.length - 1) : startIndex
  const endIndex = rowOffsets.value.findIndex(metric => metric.top > visibleBottom + overscan)
  visibleRange.value = {
    end: endIndex === -1 ? infinite.rows.value.length : endIndex,
    start,
  }

  const isScrollingDown = scroller.scrollTop > previousScrollTop
  previousScrollTop = scroller.scrollTop
  if (isScrollingDown && scroller.scrollTop + window.innerHeight > scroller.scrollHeight - 600)
    infinite.loadMore()

  nextTick(() => {
    const firstVisibleRow = [...viewport.querySelectorAll<HTMLElement>('[data-stat-offset]')]
      .find((row) => {
        const rect = row.getBoundingClientRect()
        return rect.bottom > stickyBottom && rect.top < window.innerHeight
      })
    if (firstVisibleRow?.dataset.statOffset)
      infinite.setActiveOffset(Number(firstVisibleRow.dataset.statOffset))
  })
}

function scheduleVirtualListSync() {
  if (scrollFrame !== null)
    return
  scrollFrame = requestAnimationFrame(syncVirtualList)
}

async function fillViewport() {
  if (isFillingViewport)
    return

  isFillingViewport = true
  try {
    for (let i = 0; i < 8; i++) {
      await nextTick()
      const scroller = document.scrollingElement
      if (!scroller || scroller.scrollHeight > window.innerHeight + 200 || !infinite.canLoadMore.value || infinite.isExhausted.value)
        break

      const rowsCount = infinite.rows.value.length
      infinite.loadMore()
      await nextTick()
      if (infinite.rows.value.length === rowsCount)
        break
    }
  }
  finally {
    isFillingViewport = false
    scheduleVirtualListSync()
  }
}

function onResize() {
  scheduleVirtualListSync()
  fillViewport()
}

function addPageListeners() {
  window.addEventListener('scroll', scheduleVirtualListSync, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
}

function removePageListeners() {
  window.removeEventListener('scroll', scheduleVirtualListSync)
  window.removeEventListener('resize', onResize)
  if (scrollFrame !== null) {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = null
  }
}

function scrollPageToTop() {
  previousScrollTop = 0
  window.scrollTo({ top: 0 })
}

function resetFeed() {
  infinite.reset()
  visibleRange.value = { end: 20, start: 0 }
  nextTick(async () => {
    scrollPageToTop()
    scheduleVirtualListSync()
    await fillViewport()
  })
}

watch([filterBy, isShowWithDesc], () => nextTick(resetFeed))
watch([
  () => JSON.stringify({
    customDate: props.ctx.params.statDate.params.value.customDate,
    granularityBy: props.ctx.params.statDate.params.value.granularityBy,
    granularityDuration: props.ctx.params.statDate.params.value.granularityDuration,
    isShowMaxRange: props.ctx.params.statDate.params.value.isShowMaxRange,
    isSkipEmpty: props.ctx.params.statDate.params.value.isSkipEmpty,
    rangeBy: props.ctx.params.statDate.params.value.rangeBy,
    rangeDuration: props.ctx.params.statDate.params.value.rangeDuration,
    rangeOffset: props.ctx.params.statDate.params.value.rangeOffset,
  }),
  () => props.ctx.params.statTab.value,
  () => props.ctx.filteredCategoriesIds.value.join(','),
  () => props.ctx.filteredType.value,
  () => props.ctx.params.filter.categoriesIds.value.join(','),
  () => props.ctx.params.filter.walletsIds.value.join(','),
], () => nextTick(resetFeed))
watch(() => props.ctx.params.statDate.scrollRangeResetVersion.value, () => nextTick(resetFeed))
watch(infinite.rows, () => nextTick(scheduleVirtualListSync))

onMounted(() => {
  previousScrollTop = document.scrollingElement?.scrollTop ?? 0
  infinite.loadMore()
  addPageListeners()
  nextTick(async () => {
    scheduleVirtualListSync()
    await fillViewport()
  })
})

onActivated(() => {
  previousScrollTop = document.scrollingElement?.scrollTop ?? 0
  addPageListeners()
  nextTick(async () => {
    scheduleVirtualListSync()
    await fillViewport()
  })
})

onDeactivated(removePageListeners)
onBeforeUnmount(removePageListeners)
</script>

<template>
  <div class="min-w-0">
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

    <div
      ref="virtualViewport"
      class="stat-trns-virtual pr-1"
      :style="{ height: `${totalEstimatedHeight}px` }"
    >
      <div :style="{ transform: `translateY(${virtualOffset}px)` }">
        <div
          v-for="row in virtualRows"
          :key="row.data.id"
          :data-stat-offset="'offset' in row.data ? row.data.offset : undefined"
        >
          <div
            v-if="row.data.type === 'periodAnchor'"
            aria-hidden="true"
            class="h-px"
          />

          <TrnsListRow
            v-else-if="row.data.type === 'dateHeader' || row.data.type === 'transaction'"
            :isShowGroupSum="true"
            :row="row.data"
          />

          <div
            v-else-if="row.data.type === 'loader' && infinite.canLoadMore.value"
            class="px-2 py-1"
          >
            <button
              type="button"
              class="flex-center w-full rounded-sm bg-elevated px-5 py-2 text-sm text-muted hover:bg-accented"
              @click="infinite.loadMore()"
            >
              {{ t('trns.more') }}
            </button>
          </div>

          <TrnsNoTrns
            v-else-if="row.data.type === 'end' && transactionsCount === 0"
          />
        </div>
      </div>
    </div>
  </div>
</template>
