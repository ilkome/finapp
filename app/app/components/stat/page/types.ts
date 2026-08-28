import type { ComponentPublicInstance } from 'vue'

import type { FilterProvider } from '~/components/filter/types'
import type { StatConfigParams } from '~/components/stat/config/types'
import type { UseStatDateOptions } from '~/components/stat/date/types'
import type { TrnsListFilterSnapshot } from '~/components/trns/types'

export type StatPageProvidersOptions = {
  config: StatConfigParams
  date: UseStatDateOptions
  filter: FilterProvider
  initialTrnsViewState?: TrnsListFilterSnapshot
}

export type StatPageHostOptions = {
  stickyNavigation?: boolean
  virtualFeed?: boolean
}

export type StatHeaderInstance = ComponentPublicInstance & {
  stickyMainElement: HTMLElement | null
  stickyRootElement: HTMLElement | null
}
