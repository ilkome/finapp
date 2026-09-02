import type { Condition } from './types'

export type ConditionField = 'period' | 'parentCategoryCount' | 'allCategoryCount' | 'contentWidth'

export function getConditionField(condition: Condition): ConditionField {
  if (condition.kind !== 'categoryCount')
    return condition.kind

  return condition.scope === 'parent' ? 'parentCategoryCount' : 'allCategoryCount'
}

export function changeConditionField(condition: Condition, field: ConditionField): Condition {
  if (field === 'period')
    return { comparator: condition.comparator, kind: field, unit: 'day', value: 1 }
  if (field === 'contentWidth')
    return { comparator: condition.comparator, kind: field, unit: 'px', value: 768 }

  const nextCondition: Condition = {
    comparator: condition.comparator,
    kind: 'categoryCount',
    scope: field === 'parentCategoryCount' ? 'parent' : 'all',
    value: condition.kind === 'categoryCount' ? condition.value : 0,
  }

  return nextCondition
}
