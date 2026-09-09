import type { Condition } from './types'

export type ConditionField = 'period' | 'contentWidth' | 'walletSelection' | 'category'

export const blockRuleConditionFields: ConditionField[] = ['period', 'contentWidth', 'walletSelection', 'category']
export const autoRuleConditionFields: ConditionField[] = ['walletSelection', 'category']

export function getConditionField(condition: Condition): ConditionField {
  return condition.kind === 'categoryCount' || condition.kind === 'categorySelection'
    ? 'category'
    : condition.kind
}

export function changeConditionField(condition: Condition, field: ConditionField, contentWidth?: number | null): Condition {
  if (field === 'walletSelection')
    return { ids: [], kind: 'walletSelection', mode: 'any' }
  if (field === 'category') {
    return condition.kind === 'categoryCount' || condition.kind === 'categorySelection'
      ? condition
      : { ids: [], kind: 'categorySelection', mode: 'any' }
  }

  const comparator = 'comparator' in condition ? condition.comparator : '='
  if (field === 'period')
    return { comparator, kind: field, unit: 'day', value: 1 }
  if (field === 'contentWidth') {
    return condition.kind === 'contentWidth'
      ? condition
      : { comparator, kind: field, unit: 'px', value: contentWidth ?? 768 }
  }

  return { comparator, kind: 'period', unit: 'day', value: 1 }
}
