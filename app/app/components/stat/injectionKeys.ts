import type { InjectionKey, Ref } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { StatContextBlockId } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { StatBlockPanelId } from '~/components/stat/views/types'
import type { TrnsListFilterState } from '~/components/trns/types'

export const statDateKey: InjectionKey<StatDateProvider> = Symbol('statDate')
export const statBaseConfigKey: InjectionKey<StatConfigProvider> = Symbol('statBaseConfig')
export const statConfigKey: InjectionKey<StatConfigProvider> = Symbol('statConfig')
export const statConfigOverlayOwnerKey: InjectionKey<string> = Symbol('statConfigOverlayOwner')
export const statConfigParameterIdsKey: InjectionKey<Readonly<Ref<ReadonlySet<string> | null>>> = Symbol('statConfigParameterIds')
export const statConfigParameterRemoveKey: InjectionKey<(id: string) => void> = Symbol('statConfigParameterRemove')
export const statContentWidthKey: InjectionKey<Ref<number | null>> = Symbol('statContentWidth')
export const statContextBlockIdsKey: InjectionKey<Readonly<Ref<readonly StatContextBlockId[]>>> = Symbol('statContextBlockIds')
/** Panels a page never renders; the settings drawer skips them too. */
export const statHiddenPanelsKey: InjectionKey<readonly StatBlockPanelId[]> = Symbol('statHiddenPanels')
export const statHistoryAvailableKey: InjectionKey<Ref<boolean>> = Symbol('statHistoryAvailable')
export const statViewControllerKey: InjectionKey<ReturnType<typeof import('~/components/stat/views/useStatViewController').useStatViewController>> = Symbol('statViewController')
/** Set by a page whose category cloud opens a category's stat sheet instead of filtering; a sheet resets it. */
export const statCategorySheetKey: InjectionKey<((categoryId: CategoryId) => void) | null> = Symbol('statCategorySheet')
/** A stat sheet over a page: document-wide view transitions would draw their snapshots above it. */
export const statInSheetKey: InjectionKey<boolean> = Symbol('statInSheet')
export const statCanSplitKey: InjectionKey<Ref<boolean>> = Symbol('statCanSplit')
export const statPreservedCategoryScrollTopKey: InjectionKey<Ref<number | null>> = Symbol('statPreservedCategoryScrollTop')
export const statStickyNavKey: InjectionKey<boolean> = Symbol('statStickyNav')
export const statStickyTopKey: InjectionKey<Readonly<Ref<number>>> = Symbol('statStickyTop')
export const statTrnsViewStateKey: InjectionKey<TrnsListFilterState> = Symbol('statTrnsViewState')
export const statVirtualFeedKey: InjectionKey<boolean> = Symbol('statVirtualFeed')
