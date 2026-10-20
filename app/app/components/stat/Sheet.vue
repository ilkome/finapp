<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatDateParams } from '~/components/stat/date/types'
import type { StatReportType } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatPageFilter } from '~/components/filter/useStatPageFilter'
import { isShowNavHome } from '~/components/stat/date/navigationPredicates'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { statCategorySheetKey, statInSheetKey, statStickyNavKey, statStickyTopKey, statVirtualFeedKey } from '~/components/stat/injectionKeys'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/**
 * A category's or a wallet's statistics in a sheet over the current page. With `date` it is a view of
 * the page that opened it (its config, wallets filter and selected period) kept for this session only;
 * without it, a wallet's own page settings.
 */
const props = defineProps<{
  categoryId?: CategoryId
  config?: unknown
  date?: Partial<StatDateParams>
  filterQuery?: Record<string, string | string[] | undefined>
  walletId?: WalletId
}>()

const emit = defineEmits<{
  closed: []
}>()

const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

provide(statCategorySheetKey, null)
provide(statInSheetKey, true)
provide(statStickyNavKey, false)
provide(statStickyTopKey, ref(0))
// The sheet scrolls by itself, so the window-scroll virtual feed cannot run in it.
provide(statVirtualFeedKey, false)

const isSeeded = !!props.date
const storage = isSeeded ? sessionStorage : localStorage
const storageKey = isSeeded
  ? `stat-sheet-${props.categoryId ? 'category' : 'wallet'}-${props.categoryId ?? props.walletId}`
  : props.categoryId ? `page-${props.categoryId}` : `${props.walletId}`

const category = computed(() => props.categoryId ? categoriesStore.items[props.categoryId] : undefined)
const title = computed(() => category.value?.name ?? walletsStore.items?.[props.walletId!]?.name ?? '')
const titleIcon = computed(() => category.value && { color: category.value.color, name: category.value.icon })

const { filter, filterTrnsIds } = useStatPageFilter({
  canFilterCategories: !props.categoryId,
  canFilterWallets: !props.walletId,
  localQuery: props.filterQuery ?? {},
  storageKey,
})

const allTrnsIds = computed(() => props.categoryId
  ? trnsStore.getStoreTrnsIds({ categoriesIds: categoriesStore.getChildrenIdsOrParent(props.categoryId) })
  : trnsStore.getStoreTrnsIds({ walletsIds: [props.walletId!] }))
const trnsIds = computed(() => filterTrnsIds({ trnsIds: allTrnsIds.value }))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const singleTrnType = computed<StatReportType | null>(() => {
  if (!props.categoryId)
    return null
  const types = new Set(allTrnsIds.value.map(id => trnsStore.items?.[id]?.type))
  const hasExpense = types.has('expense')
  return hasExpense === types.has('income') ? null : hasExpense ? 'expense' : 'income'
})

const isLoanWallet = !!props.walletId && walletsStore.items?.[props.walletId]?.type === 'loan'
const { contentWidth, statConfig, statDate } = useStatPageProviders({
  config: { initialConfig: props.config, storage, storageKey, storageQuery: {} },
  date: {
    // A loan moves once a month over years, as on its wallet page.
    initParams: props.date ?? (isLoanWallet ? { granularityBy: 'month', isShowMaxRange: true } : undefined),
    key: storageKey,
    maxRange,
    overrideStoredWithInitParams: isSeeded,
    storage,
  },
  filter,
})

const quickRangeIds = computed(() => {
  const selected = new Set(statConfig.config.value.date.quickRangeIds)
  return statConfig.config.value.date.quickRangeOrderIds.filter(id => selected.has(id))
})
const isRangeReset = computed(() => statConfig.config.value.date.isResetInRange
  && isShowNavHome(statDate.params.value, statDate.range.value, new Date()))

const contextRange = computed(() => resolveStatSelectionRange(
  statDate.range.value,
  statDate.selectedInterval.value,
  statDate.params.value.intervalSelected,
))
const { hiddenPanels } = useStatPageViews({
  categoryId: () => props.categoryId,
  contentWidth,
  filter,
  range: contextRange,
  statConfig,
  trnsIds,
  walletId: () => props.walletId,
})
</script>

<template>
  <UiSheet
    :title
    :titleIcon
    :collapsedSnap="500"
    modalClass="sm:max-w-3xl"
    @closed="emit('closed')"
  >
    <div class="content-start pb-32 md:pb-4" data-stat-sheet>
      <StatLayout
        :categoryId
        :hiddenPanels
        :lockSingleTypeLayout="singleTrnType !== null"
        :preCategoriesIds="categoryId ? categoriesStore.getChildrenIds(categoryId) : undefined"
        :reportType="singleTrnType ?? 'combined'"
        :storageKey
        :trnsIds
        :walletId
        :hasChildren="!!walletId"
        :showWallets="!!categoryId"
        isNavigationOutside
      />

      <UiSheetFooter>
        <!-- The same capsule as the currency filter in the wallets drawer. -->
        <!-- Full width despite the footer inset: 12.5% of the inset box is the footer's 10%. -->
        <div class="swiper-no-swiping -mx-[12.5%] touch-pan-x scrollbar-none overflow-x-auto overscroll-x-contain px-3 [&::-webkit-scrollbar]:hidden">
          <div class="h-9 w-max min-w-max overflow-hidden rounded-full border border-default/80 bg-default/20 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50">
            <StatDateRanges
              class="h-full"
              :optionIds="quickRangeIds"
              :statDate
              tabsClass="h-full w-max min-w-max overflow-visible! px-3 *:h-full"
              variant="text"
              view="all"
            />
          </div>
        </div>
        <StatDateRangeButton isBlock :isReset="isRangeReset" />
        <StatFilterButton isBlock />
      </UiSheetFooter>
    </div>
  </UiSheet>
</template>
