import { describe, expect, it } from 'vitest'

import { defaultConfig } from '~/components/stat/config/schema'

import type { ConditionGroup, StatView } from './types'

import { evaluateConditionGroup, findAutomaticView } from './evaluateConditions'
import { generateViewName } from './generateViewName'
import { migrateStatView } from './schema'

const context = {
  categoryCount: 12,
  parentCategoryCount: 4,
  range: { end: new Date(2026, 0, 7).getTime(), start: new Date(2026, 0, 1).getTime() },
  selectedCategoryIds: [],
  selectedWalletIds: [],
}

function view(id: string, sortOrder: number, rule: ConditionGroup = { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 10 }], operator: 'and' }): StatView {
  return {
    autoRule: rule,
    config: defaultConfig,
    createdAt: 1,
    id,
    isAutoEnabled: true,
    name: id,
    schemaVersion: 1,
    scope: 'dashboard' as const,
    sortOrder,
    updatedAt: 1,
    userId: 'user',
  }
}

describe('statistics saved views', () => {
  it('validates persisted records and rejects enabled views without a rule', () => {
    expect(migrateStatView(view('valid', 0))).not.toBeNull()
    expect(migrateStatView({ ...view('invalid', 0), autoRule: null })).toBeNull()
  })

  it('backfills settings added after a view was saved', () => {
    const legacy = structuredClone(view('legacy', 0)) as any
    delete legacy.config.trns.isShowHistory
    delete legacy.config.trns.isShowTitle
    delete legacy.config.trns.isShowTypeTabs
    delete legacy.config.chart.isShowBackground
    delete legacy.config.date.isPinned
    delete legacy.config.date.isShowNavigation
    delete legacy.config.date.quickRangeIds
    delete legacy.config.summary
    delete legacy.config.wallets.displayMode
    delete legacy.config.wallets.selectionMode
    delete legacy.config.categories.bars.grouping
    delete legacy.config.categories.list.backgroundType
    delete legacy.config.categories.list.isShowTitle
    delete legacy.config.categories.list.trendType
    delete legacy.config.page.blockOrder
    legacy.config.categories.bars.isGrouped = false

    const migrated = migrateStatView(legacy)

    expect(migrated?.config.trns).toEqual({ isShow: true, isShowHistory: true, isShowTitle: true, isShowTypeTabs: true })
    expect(migrated?.config.chart.isShowBackground).toBe(false)
    expect(migrated?.config.date).toEqual({
      isPinned: true,
      isShowNavigation: true,
      isShowQuick: false,
      quickRangeIds: defaultConfig.date.quickRangeIds,
    })
    expect(migrated?.config.summary).toEqual({ isPinned: true, isShowChart: true })
    expect(migrated?.config.wallets).toMatchObject({ displayMode: 'recent', selectionMode: 'multiple' })
    expect(migrated?.config.categories.bars.grouping).toBe('child')
    expect(migrated?.config.categories.list.backgroundType).toBe('none')
    expect(migrated?.config.categories.list.isShowTitle).toBe(true)
    expect(migrated?.config.categories.list.trendType).toBe('bar')
    expect(migrated?.config.page.blockOrder).toEqual(defaultConfig.page.blockOrder)
  })

  it('adds new leading blocks before a saved legacy order', () => {
    const legacy = structuredClone(view('legacy-order', 0)) as any
    legacy.config.page.blockOrder = ['chart', 'wallets', 'catsRound', 'catsList', 'vertical', 'trns']

    const migrated = migrateStatView(legacy)

    expect(migrated?.config.page.blockOrder).toEqual([
      'navigation',
      'summary',
      'chart',
      'wallets',
      'catsRound',
      'catsList',
      'vertical',
      'trns',
    ])
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

  it('generates names with a deterministic duplicate suffix', () => {
    const labels = {
      and: 'and',
      andMore: (count: number) => `and ${count} more`,
      categoryCount: (scope: string, comparator: string, value: number) => `${comparator} ${value} ${scope}`,
      fallback: 'New view',
      period: (value: number, unit: string) => `Last ${value} ${unit}s`,
    }
    expect(generateViewName({ children: [{ comparator: '=', kind: 'period', unit: 'day', value: 7 }], operator: 'and' }, labels, ['Last 7 days'])).toBe('Last 7 days 2')
  })
})
