import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import { defaultConfig } from '~/components/stat/config/schema'

import type { BlockRule, ConditionGroup, StatView } from './types'

import { cloneBlockRule, createBlockRuleOverrides, findMatchingBlockRules, resolveConfigUpdateParameterIds, resolveEffectiveStatConfig, resolveHiddenStatPanels } from './blockRules'
import { evaluateConditionGroup, findAutomaticView } from './evaluateConditions'
import { generateViewName } from './generateViewName'
import { StatViewSchema } from './schema'

const context = {
  categoryCount: 12,
  categoryPathById: {
    child: ['child', 'parent'],
    other: ['other'],
    parent: ['parent'],
  },
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
    isActive: false,
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

  it('evaluates wallet selection modes against page and global selections', () => {
    expect(evaluateConditionGroup({ children: [{ ids: [], kind: 'walletSelection', mode: 'all' }], operator: 'and' }, context)).toBe(true)
    expect(evaluateConditionGroup({ children: [{ ids: [], kind: 'walletSelection', mode: 'none' }], operator: 'and' }, context)).toBe(true)
    expect(evaluateConditionGroup({ children: [{ ids: ['wallet-2'], kind: 'walletSelection', mode: 'selected' }], operator: 'and' }, { ...context, selectedWalletIds: ['wallet-1', 'wallet-2'] })).toBe(true)
    expect(evaluateConditionGroup({ children: [{ ids: ['wallet-3'], kind: 'walletSelection', mode: 'selected' }], operator: 'and' }, { ...context, selectedWalletIds: ['wallet-1'] })).toBe(false)
  })

  it('applies a selected parent category to its descendants only', () => {
    const parentRule = { children: [{ ids: ['parent'], kind: 'categorySelection' as const, mode: 'selected' as const }], operator: 'and' as const }
    const childRule = { children: [{ ids: ['child'], kind: 'categorySelection' as const, mode: 'selected' as const }], operator: 'and' as const }

    expect(evaluateConditionGroup(parentRule, { ...context, selectedCategoryIds: ['child'] })).toBe(true)
    expect(evaluateConditionGroup(childRule, { ...context, selectedCategoryIds: ['parent'] })).toBe(false)
    expect(evaluateConditionGroup(parentRule, { ...context, selectedCategoryIds: ['other'] })).toBe(false)
  })

  it('rejects invalid entity selection records instead of normalizing them', () => {
    expect(StatViewSchema.safeParse(view('wallet', 0, { children: [{ ids: ['wallet-1'], kind: 'walletSelection', mode: 'selected' }], operator: 'and' })).success).toBe(true)
    expect(StatViewSchema.safeParse(view('empty-selected', 0, { children: [{ ids: [], kind: 'walletSelection', mode: 'selected' }], operator: 'and' })).success).toBe(false)
    expect(StatViewSchema.safeParse(view('ids-with-all', 0, { children: [{ ids: ['wallet-1'], kind: 'walletSelection', mode: 'all' }], operator: 'and' })).success).toBe(false)
    expect(StatViewSchema.safeParse(view('old-wallet-rule', 0, { children: [{ kind: 'walletSelection', walletIds: ['wallet-1'] } as never], operator: 'and' })).success).toBe(false)
  })

  it('merges every matching rule and gives conflicting parameters to the first rule', () => {
    const effective = resolveEffectiveStatConfig(defaultConfig, {
      chart: [
        { condition: { children: [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }], operator: 'and' }, id: 'first', isEnabled: true, overrides: { chart: { type: 'line' } } },
        { condition: { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }, id: 'second', isEnabled: true, overrides: { chart: { type: 'pie', valueDisplay: 'signed' } } },
      ],
    }, context)

    expect(effective.chart.type).toBe('line')
    expect(effective.chart.valueDisplay).toBe('signed')
    expect(effective.wallets).toEqual(defaultConfig.wallets)
    expect(defaultConfig.chart.type).toBe('bar')
  })

  it('keeps the first matching visibility rule as the highest priority', () => {
    const rules = {
      chart: [
        { condition: { children: [{ comparator: '<' as const, kind: 'contentWidth' as const, unit: 'px' as const, value: 768 }], operator: 'and' as const }, id: 'hidden', isEnabled: true, isHidden: true, overrides: { chart: { type: 'line' as const } } },
        { condition: { children: [{ comparator: '>' as const, kind: 'categoryCount' as const, scope: 'all' as const, value: 0 }], operator: 'and' as const }, id: 'visible', isEnabled: true, isHidden: false, overrides: { chart: { type: 'pie' as const } }, parameterIds: ['visibility'] },
      ],
    }

    const effective = resolveEffectiveStatConfig(defaultConfig, rules, context)

    expect(effective.chart.isShow).toBe(false)
    expect(effective.chart.type).toBe('line')
    expect(resolveHiddenStatPanels(rules, context)).toEqual(['chart'])
  })

  it('returns every matching rule in priority order', () => {
    const rules: BlockRule[] = [
      { condition: { children: [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }], operator: 'and' }, id: 'first', isEnabled: true, overrides: {} },
      { condition: { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }, id: 'second', isEnabled: true, overrides: {} },
    ]

    expect(findMatchingBlockRules(rules, context).map(rule => rule.id)).toEqual(['first', 'second'])
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
      categorySelection: (mode: string, ids: string[]) => `${mode} ${ids.join(',')}`,
      contentWidth: (comparator: string, value: number) => `${comparator} ${value}px`,
      fallback: 'New view',
      period: (value: number, unit: string) => `Last ${value} ${unit}s`,
      walletSelection: (mode: string, ids: string[]) => `${mode} ${ids.join(',')}`,
    }
    expect(generateViewName({ children: [{ comparator: '=', kind: 'period', unit: 'day', value: 7 }], operator: 'and' }, labels, ['Last 7 days'])).toBe('Last 7 days 2')
  })
})
