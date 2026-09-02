import { describe, expect, it } from 'vitest'

import { quickRangeOptionIds } from '~/components/stat/date/useRangeOptions'

import type { MiniItemConfig } from './schema'

import { PANELS } from './panels/registry'
import { applyConfigProps, applyConfigUpdate, ConfigSchema, statConfigBlockOrder } from './schema'

const defaultConfig: MiniItemConfig = {
  average: {
    count: 10,
    isShow: false,
  },
  categories: {
    bars: {
      grouping: 'auto',
      isShow: false,
      isShowTooltip: true,
      isShowTooltipChildren: false,
    },
    isShowEmpty: false,
    list: {
      backgroundType: 'none',
      grouping: 'parent',
      isAutoExpandParents: false,
      isLines: true,
      isRoundIcon: true,
      isShow: true,
      isShowTitle: true,
      trendType: 'bar',
    },
    round: {
      grouping: 'child',
      isHideOthersOnSelect: false,
      isIconBg: true,
      isInlineAmount: false,
      isShow: true,
      isShowFavorites: true,
      isShowRecent: true,
    },
    view: 'list',
  },
  chart: {
    breakdown: 'cashflow',
    isGrouped: true,
    isShow: true,
    isShowAverage: false,
    isShowBackground: false,
    isShowScale: false,
    layout: 'combined-wide',
    line: {
      isGradient: false,
      isShowPoints: true,
      isSkipZero: false,
      isSmooth: true,
    },
    pie: {
      isShowLabels: true,
      isShowPercent: false,
      shape: 'donut',
    },
    type: 'bar',
    valueDisplay: 'magnitude',
  },
  date: {
    isPinned: true,
    isShow: true,
    isShowNavigation: true,
    isShowQuick: false,
    quickRangeIds: ['period:day-1', 'period:week-1', 'period:month-1', 'period:month-6', 'period:year-1'],
    quickRangeOrderIds: [...quickRangeOptionIds],
  },
  page: {
    blockOrder: [...statConfigBlockOrder],
    layout: 'combined',
  },
  summary: {
    isPinned: true,
    isShow: true,
    isShowChart: true,
  },
  trns: {
    isShow: true,
    isShowHistory: true,
    isShowTitle: true,
    isShowTypeTabs: true,
  },
  wallets: {
    count: 6,
    displayMode: 'recent',
    isShow: false,
    isShowIcon: true,
    selectionMode: 'multiple',
    valueMode: 'balance',
  },
}

describe('configSchema', () => {
  it('applies nested props while preserving sibling fields', () => {
    const result = applyConfigProps(defaultConfig, {
      categories: { round: { isShowFavorites: false } },
    })

    expect(result.categories.round.isShowFavorites).toBe(false)
    expect(result.categories.round.isShowRecent).toBe(defaultConfig.categories.round.isShowRecent)
    expect(result.categories.list).toEqual(defaultConfig.categories.list)
  })

  it('validates default config', () => {
    expect(ConfigSchema.safeParse(defaultConfig).success).toBe(true)
  })

  it('backfills automatic parent expansion for existing configs', () => {
    const stored = structuredClone(defaultConfig)
    delete (stored.categories.list as Partial<typeof stored.categories.list>).isAutoExpandParents

    const result = ConfigSchema.parse(stored)

    expect(result.categories.list.isAutoExpandParents).toBe(false)
  })

  it('rejects invalid chartType', () => {
    const invalid = { ...defaultConfig, chart: { ...defaultConfig.chart, type: 'invalid' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('accepts the pie chart type', () => {
    const pie = { ...defaultConfig, chart: { ...defaultConfig.chart, type: 'pie' } }
    expect(ConfigSchema.safeParse(pie).success).toBe(true)
  })

  it.each(['area', 'stackedLine'] as const)('rejects the removed %s chart type', (type) => {
    const config = { ...defaultConfig, chart: { ...defaultConfig.chart, type } }
    expect(ConfigSchema.safeParse(config).success).toBe(false)
  })

  it('rejects an invalid chart value display mode', () => {
    const invalid = { ...defaultConfig, chart: { ...defaultConfig.chart, valueDisplay: 'invalid' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects invalid categories view', () => {
    const invalid = { ...defaultConfig, categories: { ...defaultConfig.categories, view: 'grid' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects missing required field', () => {
    const { chart: _, ...incomplete } = defaultConfig
    expect(ConfigSchema.safeParse(incomplete).success).toBe(false)
  })

  it('rejects non-boolean in nested object', () => {
    const invalid = { ...defaultConfig, categories: { ...defaultConfig.categories, list: { ...defaultConfig.categories.list, isShow: 'yes' } } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects non-number wallets.count', () => {
    const invalid = { ...defaultConfig, wallets: { ...defaultConfig.wallets, count: 'six' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })
})

describe('applyConfigUpdate', () => {
  it('updates a primitive value', () => {
    const result = applyConfigUpdate(defaultConfig, 'chart', { isShow: false })
    expect(result).not.toBeNull()
    expect(result!.chart.isShow).toBe(false)
  })

  it('updates chart.type', () => {
    const result = applyConfigUpdate(defaultConfig, 'chart', { type: 'line' } as any)
    expect(result).not.toBeNull()
    expect(result!.chart.type).toBe('line')
  })

  it('updates chart layout mode', () => {
    const result = applyConfigUpdate(defaultConfig, 'chart', { layout: 'combined-narrow' } as any)
    expect(result).not.toBeNull()
    expect(result!.chart.layout).toBe('combined-narrow')
  })

  it('deep-merges nested object', () => {
    const result = applyConfigUpdate(defaultConfig, 'categories', { list: { grouping: 'child' } })
    expect(result).not.toBeNull()
    expect(result!.categories.list.grouping).toBe('child')
    // Other fields preserved via defu
    expect(result!.categories.list.isShow).toBe(true)
    expect(result!.categories.list.isLines).toBe(true)
    expect(result!.categories.round).toEqual(defaultConfig.categories.round)
  })

  it('normalizes a partial block order without duplicates', () => {
    const result = ConfigSchema.parse({
      ...defaultConfig,
      page: { ...defaultConfig.page, blockOrder: ['trns', 'chart', 'trns'] },
    })

    expect(result.page.blockOrder).toEqual([
      'navigation',
      'summary',
      'trns',
      'chart',
      ...statConfigBlockOrder.filter(id => id !== 'navigation' && id !== 'summary' && id !== 'trns' && id !== 'chart'),
    ])
  })

  it('stores the normalized block order after an update', () => {
    const result = applyConfigUpdate(defaultConfig, 'page', { blockOrder: ['trns', 'chart', 'trns'] as any })

    expect(result?.page.blockOrder).toEqual([
      'navigation',
      'summary',
      'trns',
      'chart',
      ...statConfigBlockOrder.filter(id => id !== 'navigation' && id !== 'summary' && id !== 'trns' && id !== 'chart'),
    ])
  })

  it('keeps comparison columns above the category list', () => {
    const blockOrder: MiniItemConfig['page']['blockOrder'] = [
      ...statConfigBlockOrder.filter(id => id !== 'vertical'),
      'vertical',
    ]
    const result = applyConfigUpdate(defaultConfig, 'page', { blockOrder })

    expect(result!.page.blockOrder.indexOf('vertical')).toBeLessThan(result!.page.blockOrder.indexOf('catsList'))
  })

  it('disables transaction history when transactions are not the last block', () => {
    const blockOrder: MiniItemConfig['page']['blockOrder'] = ['trns', ...statConfigBlockOrder.filter(id => id !== 'trns')]
    const result = applyConfigUpdate(defaultConfig, 'page', { blockOrder })

    expect(result?.page.blockOrder).toEqual(blockOrder)
    expect(result?.trns.isShowHistory).toBe(false)
  })

  it('allows transaction history when transactions are the last block', () => {
    const result = applyConfigUpdate(defaultConfig, 'trns', { isShowHistory: true })

    expect(result?.trns.isShowHistory).toBe(true)
  })

  it('migrates legacy category grouping booleans', () => {
    const legacy = structuredClone(defaultConfig) as any
    delete legacy.categories.list.grouping
    delete legacy.categories.round.grouping
    delete legacy.categories.bars.grouping
    legacy.categories.list.isGrouped = true
    legacy.categories.round.isGrouped = false
    legacy.categories.bars.isGrouped = true

    const result = ConfigSchema.parse(legacy)

    expect(result.categories.list.grouping).toBe('parent')
    expect(result.categories.round.grouping).toBe('child')
    expect(result.categories.bars.grouping).toBe('parent')
  })

  it('deep-merges wallets count', () => {
    const result = applyConfigUpdate(defaultConfig, 'wallets', { count: 12 })
    expect(result).not.toBeNull()
    expect(result!.wallets.count).toBe(12)
    expect(result!.wallets.isShow).toBe(false) // preserved
  })

  it('updates wallet display, value, and selection modes', () => {
    const result = applyConfigUpdate(defaultConfig, 'wallets', { displayMode: 'period', selectionMode: 'single', valueMode: 'period' })

    expect(result?.wallets).toMatchObject({ displayMode: 'period', selectionMode: 'single', valueMode: 'period' })
    expect(result?.wallets.count).toBe(6)
  })

  it('returns null for invalid value', () => {
    const result = applyConfigUpdate(defaultConfig, 'chart', { type: 'invalid' } as any)
    expect(result).toBeNull()
  })

  it('returns null for invalid nested value', () => {
    const result = applyConfigUpdate(defaultConfig, 'wallets', { count: 'bad' } as any)
    expect(result).toBeNull()
  })

  it('does not mutate original config', () => {
    const original = { ...defaultConfig, chart: { ...defaultConfig.chart, isShow: true } }
    applyConfigUpdate(original, 'chart', { isShow: false })
    expect(original.chart.isShow).toBe(true)
  })

  it('preserves other keys when updating one', () => {
    const result = applyConfigUpdate(defaultConfig, 'categories', { isShowEmpty: true })
    expect(result).not.toBeNull()
    expect(result!.categories.isShowEmpty).toBe(true)
    expect(result!.chart.type).toBe('bar')
    expect(result!.categories.list).toEqual(defaultConfig.categories.list)
  })
})

describe('panel registry', () => {
  it('reads and updates each panel visibility without changing unrelated values', () => {
    for (const panel of Object.values(PANELS)) {
      let config = structuredClone(defaultConfig)
      const originalChartType = config.chart.type
      const provider = {
        config: { value: config },
        updateConfig(key: keyof MiniItemConfig, value: any) {
          config = applyConfigUpdate(config, key, value)!
          this.config.value = config
        },
      }
      const before = panel.getIsShow(config)
      panel.setIsShow(provider as any, !before)

      expect(panel.getIsShow(config)).toBe(!before)
      expect(config.chart.type).toBe(originalChartType)
    }
  })

  it('supports visibility for every panel', () => {
    for (const panel of Object.values(PANELS)) {
      expect(panel.getIsShow).toBeTypeOf('function')
      expect(panel.setIsShow).toBeTypeOf('function')
    }
  })
})
