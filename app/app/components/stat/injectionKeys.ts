import type { InjectionKey, Ref } from 'vue'

import type { StatDateProvider } from '~/components/stat/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { StatConfigPanelId } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

export const filterKey: InjectionKey<FilterProvider> = Symbol('filter')
export const statDateKey: InjectionKey<StatDateProvider> = Symbol('statDate')
export const statConfigKey: InjectionKey<StatConfigProvider> = Symbol('statConfig')
export const statConfigPanelKey: InjectionKey<Ref<StatConfigPanelId>> = Symbol('statConfigPanel')
// Set on the dashboard so the date/filter nav row pins to the top (with the
// header's background) while the page header scrolls away. Absent elsewhere.
export const statStickyNavKey: InjectionKey<boolean> = Symbol('statStickyNav')
