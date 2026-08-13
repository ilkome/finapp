<script setup lang="ts">
import type { Virtualizer } from '@tanstack/vue-virtual'
import type { ComponentPublicInstance } from 'vue'

import { useWindowVirtualizer } from '@tanstack/vue-virtual'

import type { StatVirtualRow } from '~/components/stat/types'
import type { StatReportContext } from '~/components/stat/useStatReportContext'

import { statPreservedCategoryScrollTopKey, statStickyTopKey } from '~/components/stat/injectionKeys'
import { shouldRequestStatHistoryLoad } from '~/components/stat/statFeed'
import { useStatFeedViewport } from '~/components/stat/useStatFeedViewport'
import { useStatInfinitePeriods } from '~/components/stat/useStatInfinitePeriods'
import { TrnType } from '~/components/trns/types'
import { useTrnsListFilters } from '~/components/trns/useTrnsListFilters'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{ ctx: StatReportContext }>()
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
  localFilter,
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
  candidateIds,
  isEnabled: computed(() => true),
  localFilter,
})
const feedHeader = useTemplateRef<HTMLElement>('feedHeader')
const virtualViewport = useTemplateRef<HTMLElement>('virtualViewport')
const scrollMargin = shallowRef(0)
const stickyBottom = shallowRef(0)
const isFillingViewport = shallowRef(false)
const isReconciling = shallowRef(false)
const transactionsCount = computed(() => infinite.rows.value.filter(row => row.type === 'transaction').length)

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
    isFillingViewport: isFillingViewport.value,
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
const viewport = useStatFeedViewport({
  ctx: props.ctx,
  feedHeader,
  infinite,
  isFillingViewport,
  isReconciling,
  preservedCategoryScrollTop,
  scrollMargin,
  stickyBottom,
  stickyTop,
  transactionsCount,
  virtualizer,
  virtualViewport,
})
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
</script>

<template>
  <div
    class="min-w-0"
    :data-stat-active-offset="isDev ? (ctx.params.statDate.scrollRangeOffset.value ?? ctx.params.statDate.params.value.rangeOffset) : undefined"
    :data-stat-active-transition-count="isDev ? viewport.activePeriodTransitionCount.value : undefined"
    :data-stat-listener-count="isDev ? viewport.activeListenerCount.value : undefined"
    :data-stat-observer-count="isDev ? viewport.activeObserverCount.value : undefined"
    :data-stat-loaded-offsets="isDev ? JSON.stringify(infinite.loadedOffsets.value) : undefined"
    :data-stat-load-count="isDev ? infinite.loadRequestCount.value : undefined"
    :data-stat-load-reason="isDev ? infinite.lastLoadReason.value : undefined"
    :data-stat-index-build-count="isDev ? infinite.indexBuildCount.value : undefined"
    :data-stat-index-build-duration="isDev ? infinite.indexBuildDuration.value.toFixed(2) : undefined"
    :data-stat-index-visited-ids="isDev ? infinite.indexVisitedIds.value : undefined"
    :data-stat-row-build-count="isDev ? infinite.rowBuildCount.value : undefined"
    :data-stat-row-build-duration="isDev ? infinite.rowBuildDuration.value.toFixed(2) : undefined"
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
        :style="{ transform: `translateY(${virtualRow.start - viewport.scrollMargin.value}px)` }"
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
