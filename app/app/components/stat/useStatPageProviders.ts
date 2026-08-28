import type { StatPageProvidersOptions } from '~/components/stat/page/types'
import type { TrnsListFilterState } from '~/components/trns/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { useStatConfig } from '~/components/stat/config/useStatConfig'
import { useStatDate } from '~/components/stat/date/useStatDate'
import { statCanSplitKey, statConfigKey, statDateKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'

export function useStatPageProviders(options: StatPageProvidersOptions) {
  const statConfig = useStatConfig(options.config)
  const statDate = useStatDate(options.date)
  const canSplit = ref(false)
  const trnsViewState: TrnsListFilterState = {
    filterBy: ref(options.initialTrnsViewState?.filterBy ?? 'all'),
    isShowHistoryWithDesc: ref(options.initialTrnsViewState?.isShowHistoryWithDesc ?? false),
    isShowWithDesc: ref(options.initialTrnsViewState?.isShowWithDesc ?? false),
  }

  provide(filterKey, options.filter)
  provide(statCanSplitKey, canSplit)
  provide(statConfigKey, statConfig)
  provide(statDateKey, statDate)
  provide(statTrnsViewStateKey, trnsViewState)

  return { canSplit, statConfig, statDate, trnsViewState }
}
