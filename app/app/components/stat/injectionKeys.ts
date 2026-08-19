import type { InjectionKey, Ref } from 'vue'

import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { StatConfigPanelId } from '~/components/stat/types'
import type { TrnsListFilterState } from '~/components/trns/types'

export const statDateKey: InjectionKey<StatDateProvider> = Symbol('statDate')
export const statConfigKey: InjectionKey<StatConfigProvider> = Symbol('statConfig')
export const statConfigPanelKey: InjectionKey<Ref<StatConfigPanelId>> = Symbol('statConfigPanel')
export const statCanSplitKey: InjectionKey<Ref<boolean>> = Symbol('statCanSplit')
export const statPreservedCategoryScrollTopKey: InjectionKey<Readonly<Ref<number | null>>> = Symbol('statPreservedCategoryScrollTop')
export const statStickyNavKey: InjectionKey<boolean> = Symbol('statStickyNav')
export const statStickyTopKey: InjectionKey<Readonly<Ref<number>>> = Symbol('statStickyTop')
export const statTrnsViewStateKey: InjectionKey<TrnsListFilterState> = Symbol('statTrnsViewState')
export const statVirtualFeedKey: InjectionKey<boolean> = Symbol('statVirtualFeed')
