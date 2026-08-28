import type { Period, Range } from '~~/utils/date/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'

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

export type Condition = PeriodCondition | CategoryCountCondition
export type ConditionGroup = { children: Array<Condition | ConditionGroup>, operator: 'and' | 'or' }

export type StatView = {
  autoRule: ConditionGroup | null
  config: MiniItemConfig
  createdAt: number
  id: string
  isAutoEnabled: boolean
  name: string
  schemaVersion: number
  scope: StatViewScope
  sortOrder: number
  updatedAt: number
  userId: string
}

export type StatViewContext = {
  categoryCount: number
  parentCategoryCount: number
  range: Range
  selectedCategoryIds: string[]
  selectedWalletIds: string[]
}
