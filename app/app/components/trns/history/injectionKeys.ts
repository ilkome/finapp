import type { InjectionKey } from 'vue'

import type { HistoryFiltersController } from '~/components/trns/history/useHistoryFilters'

export const historyFiltersKey: InjectionKey<HistoryFiltersController> = Symbol('historyFilters')
