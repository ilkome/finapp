import type { StatPageProvidersOptions } from '~/components/stat/page/types'
import type { TrnsListFilterState } from '~/components/trns/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { useStatConfig } from '~/components/stat/config/useStatConfig'
import { useStatDate } from '~/components/stat/date/useStatDate'
import { statConfigKey, statDateKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'

export function useStatPageProviders(options: StatPageProvidersOptions) {
  const statConfig = useStatConfig(options.config)
  const statDate = useStatDate(options.date)
  const trnsViewState: TrnsListFilterState = {
    filterBy: ref(options.initialTrnsViewState?.filterBy ?? 'all'),
    isShowWithDesc: ref(options.initialTrnsViewState?.isShowWithDesc ?? false),
  }

  provide(filterKey, options.filter)
  provide(statConfigKey, statConfig)
  provide(statDateKey, statDate)
  provide(statTrnsViewStateKey, trnsViewState)

  return { statConfig, statDate, trnsViewState }
}
