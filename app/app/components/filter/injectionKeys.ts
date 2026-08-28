import type { InjectionKey } from 'vue'

import type { FilterProvider } from '~/components/filter/types'

export const filterKey: InjectionKey<FilterProvider> = Symbol('filter')
