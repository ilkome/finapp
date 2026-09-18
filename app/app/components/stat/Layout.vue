<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import type { CategoryId } from '~/components/categories/types'
import type { StatReportContexts, StatSplitContexts } from '~/components/stat/report/types'
import type { SeriesSlugSelected, StatReportType } from '~/components/stat/types'
import type { StatBlockPanelId } from '~/components/stat/views/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statCanSplitKey, statContentWidthKey, statContextBlockIdsKey, statDateKey, statHistoryAvailableKey, statStickyNavKey, statStickyTopKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'
import { resolveStatLayoutBlocks } from '~/components/stat/layout/blocks'
import SplitContexts from '~/components/stat/layout/SplitContexts'
import { useStatPinnedOffsets } from '~/components/stat/layout/useStatPinnedOffsets'
import { useStatQuickWallets } from '~/components/stat/layout/useStatQuickWallets'
import { useStatReportContexts } from '~/components/stat/layout/useStatReportContexts'
import { useStatWalletPeriod } from '~/components/stat/layout/useStatWalletPeriod'
import { statDevMetrics } from '~/components/stat/statDevMetrics'

const props = withDefaults(defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  hiddenPanels?: StatBlockPanelId[]
  initialFilteredType?: SeriesSlugSelected
  isShowSearch?: boolean
  lockSingleTypeLayout?: boolean
  preCategoriesIds?: CategoryId[]
  reportType?: StatReportType
  showWallets?: boolean
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
  walletSourceTrnsIds?: TrnId[]
}>(), { reportType: 'combined' })

const emit = defineEmits<{
  contextualMaxRange: [range: Range | null]
}>()

const isDev = import.meta.dev
const filter = inject(filterKey)!
const statConfig = useStatConfigCtx()
const statDate = inject(statDateKey)!
const trnsViewState = inject(statTrnsViewStateKey)!
const hostStickyNavigation = inject(statStickyNavKey, false)
const stickyTop = inject(statStickyTopKey, ref(0))
const canSplit = inject(statCanSplitKey, ref(false))
const contentWidth = inject(statContentWidthKey, null)
const contextBlockIds = inject(statContextBlockIdsKey, computed(() => []))
const historyAvailable = inject(statHistoryAvailableKey, ref(true))
const statLayout = useTemplateRef<HTMLElement>('statLayout')
const { width: statLayoutWidth } = useElementSize(statLayout)
provide(statCanSplitKey, canSplit)

const { quickWalletIds, quickWalletTrnsIds } = useStatQuickWallets({ filter, trnsIds: computed(() => props.trnsIds) })
const { activeWalletType, combined, createContext, selectionSourceRange } = useStatReportContexts({
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
  initialFilteredType: props.initialFilteredType,
  preCategoriesIds: computed(() => props.preCategoriesIds),
  reportType: props.reportType,
  statConfig,
  statDate,
  storageKey: computed(() => props.storageKey),
  trnsIds: quickWalletTrnsIds,
  trnsViewState,
  walletId: computed(() => props.walletId),
})
const splitContexts = shallowRef<StatSplitContexts | null>(null)
const needsSplit = computed(() => canSplit.value
  && (statConfig.page.value.layout === 'split' || statConfig.chart.value.layout === 'split'))
const contexts = computed<StatReportContexts>(() => {
  const split = splitContexts.value
  return {
    combined,
    isChartSplit: !!split && canSplit.value && statConfig.chart.value.layout === 'split',
    isPageSplit: !!split && canSplit.value && statConfig.page.value.layout === 'split',
    split,
  }
})
const { contextualMaxRange, periodWalletIds, walletPeriodTotals } = useStatWalletPeriod({
  activeWalletType,
  effectiveFilteredCategoriesIds: combined.effectiveFilteredCategoriesIds,
  filter,
  quickWalletIds,
  quickWalletTrnsIds,
  selectionSourceRange,
  statDate,
  walletSourceTrnsIds: computed(() => props.walletSourceTrnsIds ?? props.trnsIds),
})
const isCategoryFocusActive = computed(() => combined.effectiveFilteredCategoriesIds.value.length > 0)
const layout = computed(() => resolveStatLayoutBlocks({
  config: statConfig.config.value,
  contextBlockIds: contextBlockIds.value,
  hasWalletFilter: filter.walletsIds.value.length > 0,
  hiddenPanels: props.hiddenPanels,
  showWallets: props.showWallets,
}))
const orderedBlocks = computed(() => layout.value.orderedBlocks)
const layoutEntries = computed(() => layout.value.entries)
const { navigationIsPinned, navigationStickyTop, setNavigationElement, setSummaryElement, summaryIsPinned, summaryStickyTop } = useStatPinnedOffsets({ hostStickyNavigation, orderedBlocks, statConfig, stickyTop })

watchEffect(() => {
  canSplit.value = statLayoutWidth.value >= 768 && !props.lockSingleTypeLayout
  historyAvailable.value = layout.value.renderedBlocks.at(-1) === 'trns'
  if (contentWidth)
    contentWidth.value = statLayoutWidth.value > 0 ? Math.round(statLayoutWidth.value) : null
})
watch(contextualMaxRange, range => emit('contextualMaxRange', range), { immediate: true })
</script>

<template>
  <div
    ref="statLayout"
    class="grid max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] gap-2 px-2 pb-24 stat-layout lg:px-4 2xl:px-8"
    :data-stat-chart-layout="statConfig.chart.value.layout"
    :data-stat-page-layout="statConfig.page.value.layout"
    :data-stat-report-context-count="isDev ? statDevMetrics.reportContextCount.value : undefined"
    :data-stat-report-get-store-count="isDev ? statDevMetrics.getStoreTrnsIdsCount.value : undefined"
    :data-stat-report-selection-count="isDev ? statDevMetrics.reportSelectionCount.value : undefined"
  >
    <SplitContexts
      v-if="needsSplit"
      :create="createContext"
      @dispose="splitContexts = null"
      @ready="splitContexts = $event"
    />

    <template v-for="entry in layoutEntries" :key="entry.key">
      <slot v-if="entry.block === 'categoryChildren'" name="categoryChildren" />
      <slot v-else-if="entry.block === 'walletBalance'" name="walletBalance" />
      <slot v-else-if="entry.block === 'walletDescription'" name="walletDescription" />
      <div
        v-else-if="entry.block === 'navigation'"
        :ref="setNavigationElement"
        data-stat-navigation
        :data-stat-pinned-block="navigationIsPinned || undefined"
        :class="[
          navigationIsPinned && 'sticky z-10 -mx-2 bg-default/90 px-2 backdrop-blur lg:-mx-4 lg:px-4',
          navigationIsPinned && 'py-1! lg:py-1!',
        ]"
        :style="navigationIsPinned ? { top: `${navigationStickyTop}px` } : undefined"
      >
        <StatDateFilterRow
          :isShowNavigation="statConfig.date.value.isShowNavigation"
          :isShowSearch="props.isShowSearch"
        />
      </div>
      <div
        v-else-if="entry.block === 'summary'"
        :ref="setSummaryElement"
        :data-stat-pinned-block="summaryIsPinned || undefined"
        :class="[
          summaryIsPinned && 'sticky z-10 bg-default/90 backdrop-blur',
          summaryIsPinned && 'py-1',
        ]"
        :style="summaryIsPinned ? { top: `${summaryStickyTop}px` } : undefined"
      >
        <StatContentSection :contexts="contexts" />
      </div>
      <StatWalletsSection
        v-else-if="entry.block === 'wallets' && props.showWallets && filter.walletsIds.value.length === 0"
        v-model:selectedWalletIds="quickWalletIds"
        :isCategoryFocusActive
        :periodWalletIds
        :walletPeriodTotals
      />
      <StatChartSection v-else-if="entry.block === 'chart'" :contexts="contexts" />
      <StatReportBlockSection v-else-if="entry.blocks" :blocks="entry.blocks" :contexts="contexts" />
    </template>
  </div>
</template>

<style scoped>
[data-stat-pinned-block] + [data-stat-pinned-block] {
  margin-top: -0.5rem;
}
</style>
