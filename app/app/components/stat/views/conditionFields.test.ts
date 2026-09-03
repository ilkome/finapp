import { describe, expect, it } from 'vitest'

import type { Condition } from './types'

import { changeConditionField, getConditionField } from './conditionFields'

describe('statistics condition fields', () => {
  it.each([
    [{ comparator: '>', kind: 'categoryCount', scope: 'parent', value: 2 }, 'category'],
    [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 5 }, 'category'],
    [{ comparator: '>', kind: 'period', unit: 'week', value: 1 }, 'period'],
    [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }, 'contentWidth'],
    [{ ids: [], kind: 'walletSelection', mode: 'all' }, 'walletSelection'],
    [{ ids: ['category'], kind: 'categorySelection', mode: 'selected' }, 'category'],
  ] satisfies Array<[Condition, string]>)('maps a persisted condition to the field option', (condition, field) => {
    expect(getConditionField(condition)).toBe(field)
  })

  it('creates entity selection conditions without carrying numeric fields', () => {
    const condition: Condition = { comparator: '>=', kind: 'period', unit: 'day', value: 7 }

    expect(changeConditionField(condition, 'walletSelection')).toEqual({ ids: [], kind: 'walletSelection', mode: 'all' })
    expect(changeConditionField(condition, 'category')).toEqual({ ids: [], kind: 'categorySelection', mode: 'all' })
    expect(changeConditionField({ ids: ['wallet'], kind: 'walletSelection', mode: 'selected' }, 'period')).toEqual({ comparator: '=', kind: 'period', unit: 'day', value: 1 })
  })

  it('uses the measured statistics content width when selecting the field', () => {
    const condition: Condition = { comparator: '<=', kind: 'period', unit: 'day', value: 7 }

    expect(changeConditionField(condition, 'contentWidth', 913)).toEqual({ comparator: '<=', kind: 'contentWidth', unit: 'px', value: 913 })
    expect(changeConditionField({ comparator: '>', kind: 'contentWidth', unit: 'px', value: 640 }, 'contentWidth', 913)).toEqual({ comparator: '>', kind: 'contentWidth', unit: 'px', value: 640 })
  })

  it('preserves an existing category condition in the combined category field', () => {
    const condition: Condition = { comparator: '>', kind: 'categoryCount', scope: 'all', value: 4 }

    expect(changeConditionField(condition, 'category')).toEqual(condition)
  })
})
