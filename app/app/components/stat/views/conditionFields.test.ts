import { describe, expect, it } from 'vitest'

import type { Condition } from './types'

import { changeConditionField, getConditionField } from './conditionFields'

describe('statistics condition fields', () => {
  it.each([
    [{ comparator: '>', kind: 'categoryCount', scope: 'parent', value: 2 }, 'parentCategoryCount'],
    [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 5 }, 'allCategoryCount'],
    [{ comparator: '>', kind: 'period', unit: 'week', value: 1 }, 'period'],
    [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }, 'contentWidth'],
  ] satisfies Array<[Condition, string]>)('maps a persisted condition to the field option', (condition, field) => {
    expect(getConditionField(condition)).toBe(field)
  })

  it('maps category field options to the persisted category condition', () => {
    const condition: Condition = { comparator: '>=', kind: 'period', unit: 'day', value: 7 }

    expect(changeConditionField(condition, 'parentCategoryCount')).toEqual({ comparator: '>=', kind: 'categoryCount', scope: 'parent', value: 0 })
    expect(changeConditionField(condition, 'allCategoryCount')).toEqual({ comparator: '>=', kind: 'categoryCount', scope: 'all', value: 0 })
  })

  it('preserves the value when switching between category scopes', () => {
    const condition: Condition = { comparator: '>', kind: 'categoryCount', scope: 'all', value: 4 }

    expect(changeConditionField(condition, 'parentCategoryCount')).toEqual({ ...condition, scope: 'parent' })
  })
})
