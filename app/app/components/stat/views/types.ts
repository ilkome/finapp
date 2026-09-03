import type { Period, Range } from '~~/utils/date/types'
import type { DeepPartial } from '~~/utils/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigPanelId } from '~/components/stat/types'

export type StatViewScope = 'dashboard'
export type ConditionComparator = '<' | '<=' | '=' | '!=' | '>=' | '>'

export type PeriodCondition = {
  comparator: ConditionComparator
  kind: 'period'
  unit: Period
  value: number
}

export type CategoryCountCondition = {
  comparator: ConditionComparator
  kind: 'categoryCount'
  scope: 'all' | 'parent'
  value: number
}

export type ContentWidthCondition = {
  comparator: ConditionComparator
  kind: 'contentWidth'
  unit: 'px'
  value: number
}

export type EntitySelectionMode = 'all' | 'none' | 'selected'

export type WalletSelectionCondition = {
  ids: string[]
  kind: 'walletSelection'
  mode: EntitySelectionMode
}

export type CategorySelectionCondition = {
  ids: string[]
  kind: 'categorySelection'
  mode: EntitySelectionMode
}

export type Condition = PeriodCondition | CategoryCountCondition | ContentWidthCondition | WalletSelectionCondition | CategorySelectionCondition
export type ConditionGroup = { children: Array<Condition | ConditionGroup>, operator: 'and' | 'or' }
export type StatBlockPanelId = Exclude<StatConfigPanelId, 'root'>
export type BlockRule = {
  condition: ConditionGroup
  id: string
  isEnabled: boolean
  isHidden?: boolean
  overrides: DeepPartial<MiniItemConfig>
  parameterIds?: string[]
}
export type StatViewConfig = {
  base: MiniItemConfig
  blockRules: Partial<Record<StatBlockPanelId, BlockRule[]>>
}

export type StatView = {
  autoRule: ConditionGroup | null
  config: StatViewConfig
  createdAt: number
  id: string
  isActive: boolean
  isAutoEnabled: boolean
  name: string
  scope: StatViewScope
  sortOrder: number
  updatedAt: number
  userId: string
}

export type StatViewContext = {
  categoryCount: number
  categoryPathById: Record<string, string[]>
  contentWidth: number | null
  parentCategoryCount: number
  range: Range
  selectedCategoryIds: string[]
  selectedWalletIds: string[]
}
