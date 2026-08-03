import type { InjectionKey, Ref } from 'vue'

import type { StatConfigProvider } from '~/components/stat/config/useStatConfig'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { StatConfigPanelId } from '~/components/stat/types'

export const statDateKey: InjectionKey<StatDateProvider> = Symbol('statDate')
export const statConfigKey: InjectionKey<StatConfigProvider> = Symbol('statConfig')
export const statConfigPanelKey: InjectionKey<Ref<StatConfigPanelId>> = Symbol('statConfigPanel')
export const statDashboardKey: InjectionKey<boolean> = Symbol('statDashboard')
// Set on the dashboard so the date/filter nav row pins below the page header.
export const statStickyNavKey: InjectionKey<boolean> = Symbol('statStickyNav')
export const statStickyTopKey: InjectionKey<Readonly<Ref<number>>> = Symbol('statStickyTop')
