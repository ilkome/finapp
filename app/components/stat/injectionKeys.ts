import type { InjectionKey } from 'vue'

import type { StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

export const filterKey: InjectionKey<FilterProvider> = Symbol('filter')
export const statDateKey: InjectionKey<StatDateProvider> = Symbol('statDate')
export const statConfigKey: InjectionKey<StatConfigProvider> = Symbol('statConfig')
