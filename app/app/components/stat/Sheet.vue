<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatDateParams } from '~/components/stat/date/types'
import type { StatReportType } from '~/components/stat/types'
import type { StatBlockPanelId } from '~/components/stat/views/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatPageFilter } from '~/components/filter/useStatPageFilter'
import { isShowNavHome } from '~/components/stat/date/navigationPredicates'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { statCategorySheetKey, statConfigOverlayOwnerKey, statHiddenPanelsKey, statInSheetKey, statStickyNavKey, statStickyTopKey, statViewControllerKey, statVirtualFeedKey } from '~/components/stat/injectionKeys'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/**
 * A category's or a wallet's statistics in a sheet over the current page. With `date` it is a view of
 * the page that opened it (its wallets filter and selected period, and for a wallet its config) kept for
 * this session only; without it, a wallet's own page settings. Every category sheet shares one config of
 * its own, kept on the device and edited from its view settings; the page's views do not apply to it.
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
// The summary pins under the floating title, as on the page under its header.
provide(statStickyNavKey, true)
provide(statStickyTopKey, ref(0))
// The sheet scrolls by itself, so the window-scroll virtual feed cannot run in it.
provide(statVirtualFeedKey, false)

const isCategory = !!props.categoryId
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
  config: isCategory
    ? { storage: localStorage, storageKey: 'stat-sheet-category', storageQuery: {} }
    : { initialConfig: props.config, storage, storageKey, storageQuery: {} },
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

const isRangeReset = computed(() => statConfig.config.value.date.isResetInRange
  && isShowNavHome(statDate.params.value, statDate.range.value, new Date()))

const contextRange = computed(() => resolveStatSelectionRange(
  statDate.range.value,
  statDate.selectedInterval.value,
  statDate.params.value.intervalSelected,
))
// The date row sits in the footer, so its block has nothing to set here.
const categoryHiddenPanels: StatBlockPanelId[] = ['navigation']
if (isCategory) {
  // The page that opened the sheet provides its own views; they must not reach this config.
  provide(statViewControllerKey, null)
  provide(statHiddenPanelsKey, categoryHiddenPanels)
  provide(statConfigOverlayOwnerKey, useId())
}
const hiddenPanels = isCategory
  ? computed(() => categoryHiddenPanels)
  : useStatPageViews({
    categoryId: () => props.categoryId,
    contentWidth,
    filter,
    range: contextRange,
    statConfig,
    trnsIds,
    walletId: () => props.walletId,
  }).hiddenPanels
</script>

<template>
  <UiSheet
    :title
    :titleIcon
    :collapsedSnap="500"
    isTitleOverlay
    modalClass="sm:max-w-3xl"
    @closed="emit('closed')"
  >
    <template #titleActions>
      <StatConfigModal v-if="isCategory">
        <StatConfigView isShared />
      </StatConfigModal>
      <StatChartSettingsPopover v-else />
    </template>

    <!-- The compact floating title has almost no bottom padding; this evens the gap under it with the one above. -->
    <div class="content-start pt-4 pb-32 md:pb-4" data-stat-sheet>
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
        <!-- Full width despite the footer inset: 12.5% of the inset box is the footer's 10%. -->
        <div class="mx-[-12.5%] grid grid-cols-2 gap-2 px-3">
          <StatFilterButton isBlock />
          <StatDateRangeButton isBlock :isReset="isRangeReset" />
        </div>
      </UiSheetFooter>
    </div>
  </UiSheet>
</template>
