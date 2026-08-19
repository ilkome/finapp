import { describe, expect, it } from 'vitest'

import type { MiniItemConfig } from './schema'

import { PANELS } from './panels/registry'
import { applyConfigProps, applyConfigUpdate, ConfigSchema } from './schema'

const defaultConfig: MiniItemConfig = {
  average: {
    count: 10,
    isShow: false,
  },
  categories: {
    bars: {
      isGrouped: false,
      isShow: false,
    },
    isShowEmpty: false,
    list: {
      isGrouped: true,
      isLines: true,
      isRoundIcon: true,
      isShow: true,
    },
    round: {
      isGrouped: false,
      isIconBg: true,
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
    layout: 'combined-wide',
    type: 'bar',
  },
  date: {
    isShowQuick: false,
  },
  page: {
    layout: 'combined',
  },
  trns: {
    isShow: true,
  },
  wallets: {
    count: 6,
    isShow: false,
    isShowIcon: true,
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

  it('rejects invalid chartType', () => {
    const invalid = { ...defaultConfig, chart: { ...defaultConfig.chart, type: 'invalid' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('accepts the pie chart type', () => {
    const pie = { ...defaultConfig, chart: { ...defaultConfig.chart, type: 'pie' } }
    expect(ConfigSchema.safeParse(pie).success).toBe(true)
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
    const result = applyConfigUpdate(defaultConfig, 'categories', { list: { isGrouped: false } })
    expect(result).not.toBeNull()
    expect(result!.categories.list.isGrouped).toBe(false)
    // Other fields preserved via defu
    expect(result!.categories.list.isShow).toBe(true)
    expect(result!.categories.list.isLines).toBe(true)
    expect(result!.categories.round).toEqual(defaultConfig.categories.round)
  })

  it('deep-merges wallets count', () => {
    const result = applyConfigUpdate(defaultConfig, 'wallets', { count: 12 })
    expect(result).not.toBeNull()
    expect(result!.wallets.count).toBe(12)
    expect(result!.wallets.isShow).toBe(false) // preserved
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

  it('reads counts from the matching panel fields', () => {
    expect(PANELS.wallets.getCount?.(defaultConfig)).toBe(defaultConfig.wallets.count)
    expect(PANELS.statAverage.getCount?.(defaultConfig)).toBe(defaultConfig.average.count)
  })
})
