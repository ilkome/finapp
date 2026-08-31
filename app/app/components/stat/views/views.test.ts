import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import { defaultConfig } from '~/components/stat/config/schema'

import type { BlockRule, ConditionGroup, StatView } from './types'

import { cloneBlockRule, createBlockRuleOverrides, resolveConfigUpdateParameterIds, resolveEffectiveStatConfig, resolveHiddenStatPanels } from './blockRules'
import { evaluateConditionGroup, findAutomaticView } from './evaluateConditions'
import { generateViewName } from './generateViewName'
import { StatViewSchema } from './schema'

const context = {
  categoryCount: 12,
  contentWidth: 720,
  parentCategoryCount: 4,
  range: { end: new Date(2026, 0, 7).getTime(), start: new Date(2026, 0, 1).getTime() },
  selectedCategoryIds: [],
  selectedWalletIds: [],
}

function view(id: string, sortOrder: number, rule: ConditionGroup = { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 10 }], operator: 'and' }): StatView {
  return {
    autoRule: rule,
    config: { base: defaultConfig, blockRules: {} },
    createdAt: 1,
    id,
    isAutoEnabled: true,
    name: id,
    scope: 'dashboard' as const,
    sortOrder,
    updatedAt: 1,
    userId: 'user',
  }
}

describe('statistics saved views', () => {
  it('validates persisted records and rejects enabled views without a rule', () => {
    expect(StatViewSchema.safeParse(view('valid', 0)).success).toBe(true)
    expect(StatViewSchema.safeParse({ ...view('invalid', 0), autoRule: null }).success).toBe(false)
    expect(StatViewSchema.safeParse({ ...view('old-config', 0), config: defaultConfig }).success).toBe(false)
    expect(StatViewSchema.safeParse({
      ...view('invalid-overrides', 0),
      config: {
        base: defaultConfig,
        blockRules: {
          chart: [{ condition: { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }, id: 'rule', isEnabled: true, overrides: { chart: { type: 'invalid' } } }],
        },
      },
    }).success).toBe(false)
  })

  it('evaluates nested AND and OR rules', () => {
    expect(evaluateConditionGroup({
      children: [
        { comparator: '>', kind: 'categoryCount', scope: 'all', value: 10 },
        { children: [{ comparator: '=', kind: 'period', unit: 'day', value: 7 }, { comparator: '>', kind: 'categoryCount', scope: 'parent', value: 10 }], operator: 'or' },
      ],
      operator: 'and',
    }, context)).toBe(true)
  })

  it('uses calendar ranges and every priority by user order', () => {
    expect(evaluateConditionGroup({ children: [{ comparator: '=', kind: 'period', unit: 'day', value: 7 }], operator: 'and' }, context)).toBe(true)
    expect(findAutomaticView([view('second', 1), view('first', 0)], context)?.id).toBe('first')
  })

  it('evaluates content width conditions only after a width is measured', () => {
    const rule = { children: [{ comparator: '<' as const, kind: 'contentWidth' as const, unit: 'px' as const, value: 768 }], operator: 'and' as const }

    expect(evaluateConditionGroup(rule, context)).toBe(true)
    expect(evaluateConditionGroup(rule, { ...context, contentWidth: null })).toBe(false)
  })

  it('applies only the first matching rule to its block', () => {
    const effective = resolveEffectiveStatConfig(defaultConfig, {
      chart: [
        { condition: { children: [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }], operator: 'and' }, id: 'first', isEnabled: true, overrides: { chart: { type: 'line' } } },
        { condition: { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }, id: 'second', isEnabled: true, overrides: { chart: { type: 'pie' } } },
      ],
    }, context)

    expect(effective.chart.type).toBe('line')
    expect(effective.wallets).toEqual(defaultConfig.wallets)
    expect(defaultConfig.chart.type).toBe('bar')
  })

  it('hides a block when the first matching rule disables its visibility', () => {
    const rules = {
      chart: [
        { condition: { children: [{ comparator: '<' as const, kind: 'contentWidth' as const, unit: 'px' as const, value: 768 }], operator: 'and' as const }, id: 'hidden', isEnabled: true, isHidden: true, overrides: { chart: { type: 'line' as const } } },
        { condition: { children: [{ comparator: '>' as const, kind: 'categoryCount' as const, scope: 'all' as const, value: 0 }], operator: 'and' as const }, id: 'visible', isEnabled: true, overrides: { chart: { type: 'pie' as const } } },
      ],
    }

    const effective = resolveEffectiveStatConfig(defaultConfig, rules, context)

    expect(effective.chart.isShow).toBe(false)
    expect(effective.chart.type).toBe('line')
    expect(resolveHiddenStatPanels(rules, context)).toEqual(['chart'])
  })

  it('can show a block hidden by its default settings', () => {
    const base = structuredClone(defaultConfig)
    base.chart.isShow = false

    const effective = resolveEffectiveStatConfig(base, {
      chart: [{
        condition: { children: [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }], operator: 'and' },
        id: 'show',
        isEnabled: true,
        isHidden: false,
        overrides: {},
        parameterIds: ['visibility'],
      }],
    }, context)

    expect(effective.chart.isShow).toBe(true)
  })

  it('stores explicitly selected parameters even when they equal the default', () => {
    expect(createBlockRuleOverrides('chart', defaultConfig, defaultConfig, ['chart.type'])).toEqual({
      chart: { type: defaultConfig.chart.type },
    })
    expect(resolveConfigUpdateParameterIds('chart', 'chart', { line: { isSmooth: true } })).toEqual(['chart.line.isSmooth'])
  })

  it('clones reactive block rules for duplication', () => {
    const source = reactive<BlockRule>({
      condition: { children: [{ comparator: '=', kind: 'period', unit: 'day', value: 1 }], operator: 'and' },
      id: 'source',
      isEnabled: true,
      overrides: { chart: { type: 'line' } },
    })

    const clone = cloneBlockRule(source)
    clone.overrides.chart!.type = 'bar'

    expect(clone).not.toBe(source)
    expect(source.overrides.chart?.type).toBe('line')
  })

  it('generates names with a deterministic duplicate suffix', () => {
    const labels = {
      and: 'and',
      andMore: (count: number) => `and ${count} more`,
      categoryCount: (scope: string, comparator: string, value: number) => `${comparator} ${value} ${scope}`,
      contentWidth: (comparator: string, value: number) => `${comparator} ${value}px`,
      fallback: 'New view',
      period: (value: number, unit: string) => `Last ${value} ${unit}s`,
    }
    expect(generateViewName({ children: [{ comparator: '=', kind: 'period', unit: 'day', value: 7 }], operator: 'and' }, labels, ['Last 7 days'])).toBe('Last 7 days 2')
  })
})
