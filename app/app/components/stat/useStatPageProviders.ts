import type { StatPageProvidersOptions } from '~/components/stat/page/types'
import type { TrnsListFilterState } from '~/components/trns/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { useStatConfig } from '~/components/stat/config/useStatConfig'
import { useStatDate } from '~/components/stat/date/useStatDate'
import { statBaseConfigKey, statCanSplitKey, statConfigKey, statContentWidthKey, statContextBlockIdsKey, statDateKey, statHistoryAvailableKey, statPreservedCategoryScrollTopKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'

export function useStatPageProviders(options: StatPageProvidersOptions) {
  const statConfig = useStatConfig(options.config)
  const statDate = useStatDate(options.date)
  const canSplit = ref(false)
  const contentWidth = ref<number | null>(null)
  const contextBlockIds = computed(() => toValue(options.contextBlockIds) ?? [])
  const historyAvailable = ref(true)
  // One per page: the block that changes the filter and the feed that reloads are separate
  // component trees, so this cannot live inside either of them.
  const preservedCategoryScrollTop = shallowRef<number | null>(null)
  const trnsViewState: TrnsListFilterState = {
    filterBy: ref(options.initialTrnsViewState?.filterBy ?? 'all'),
    isShowHistoryWithDesc: ref(options.initialTrnsViewState?.isShowHistoryWithDesc ?? false),
    isShowWithDesc: ref(options.initialTrnsViewState?.isShowWithDesc ?? false),
  }

  provide(filterKey, options.filter)
  provide(statCanSplitKey, canSplit)
  provide(statContentWidthKey, contentWidth)
  provide(statContextBlockIdsKey, contextBlockIds)
  provide(statBaseConfigKey, statConfig)
  provide(statConfigKey, statConfig)
  provide(statDateKey, statDate)
  provide(statHistoryAvailableKey, historyAvailable)
  provide(statPreservedCategoryScrollTopKey, preservedCategoryScrollTop)
  provide(statTrnsViewStateKey, trnsViewState)

  return { canSplit, contentWidth, contextBlockIds, historyAvailable, preservedCategoryScrollTop, statConfig, statDate, trnsViewState }
}
