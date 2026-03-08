import { describe, expect, it } from 'vitest'

import type { MiniItemConfig } from '~/components/stat/useStatConfig'

import { ConfigSchema } from '~/components/stat/useStatConfig'

import { applyConfigUpdate } from './statConfig'

const defaultConfig: MiniItemConfig = {
  catsList: {
    isGrouped: true,
    isItemsBg: false,
    isLines: true,
    isRoundIcon: true,
    isShow: true,
  },
  catsRound: {
    isGrouped: false,
    isShow: true,
  },
  catsView: 'list',
  chart: {
    isShowAverage: false,
  },
  chartType: 'bar',
  chartView: 'full',
  date: {
    isShowQuick: false,
  },
  isChartShow: true,
  isShowEmptyCategories: false,
  statAverage: {
    count: 10,
    isShow: false,
  },
  vertical: {
    isGrouped: false,
    isShow: false,
  },
  wallets: {
    count: 6,
    isShow: false,
  },
}

describe('configSchema', () => {
  it('validates default config', () => {
    expect(ConfigSchema.safeParse(defaultConfig).success).toBe(true)
  })

  it('rejects invalid chartType', () => {
    const invalid = { ...defaultConfig, chartType: 'invalid' }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects invalid catsView', () => {
    const invalid = { ...defaultConfig, catsView: 'grid' }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects missing required field', () => {
    const { isChartShow: _, ...incomplete } = defaultConfig
    expect(ConfigSchema.safeParse(incomplete).success).toBe(false)
  })

  it('rejects non-boolean in nested object', () => {
    const invalid = { ...defaultConfig, catsList: { ...defaultConfig.catsList, isShow: 'yes' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects non-number wallets.count', () => {
    const invalid = { ...defaultConfig, wallets: { ...defaultConfig.wallets, count: 'six' } }
    expect(ConfigSchema.safeParse(invalid).success).toBe(false)
  })
})

describe('applyConfigUpdate', () => {
  it('updates a primitive value', () => {
    const result = applyConfigUpdate(defaultConfig, 'isChartShow', false as any)
    expect(result).not.toBeNull()
    expect(result!.isChartShow).toBe(false)
  })

  it('updates chartType', () => {
    const result = applyConfigUpdate(defaultConfig, 'chartType', 'line' as any)
    expect(result).not.toBeNull()
    expect(result!.chartType).toBe('line')
  })

  it('updates chartView', () => {
    const result = applyConfigUpdate(defaultConfig, 'chartView', 'half' as any)
    expect(result).not.toBeNull()
    expect(result!.chartView).toBe('half')
  })

  it('deep-merges nested object', () => {
    const result = applyConfigUpdate(defaultConfig, 'catsList', { isGrouped: false })
    expect(result).not.toBeNull()
    expect(result!.catsList.isGrouped).toBe(false)
    // Other fields preserved via defu
    expect(result!.catsList.isShow).toBe(true)
    expect(result!.catsList.isLines).toBe(true)
  })

  it('deep-merges wallets count', () => {
    const result = applyConfigUpdate(defaultConfig, 'wallets', { count: 12 })
    expect(result).not.toBeNull()
    expect(result!.wallets.count).toBe(12)
    expect(result!.wallets.isShow).toBe(false) // preserved
  })

  it('returns null for invalid value', () => {
    const result = applyConfigUpdate(defaultConfig, 'chartType', 'invalid' as any)
    expect(result).toBeNull()
  })

  it('returns null for invalid nested value', () => {
    const result = applyConfigUpdate(defaultConfig, 'wallets', { count: 'bad' } as any)
    expect(result).toBeNull()
  })

  it('does not mutate original config', () => {
    const original = { ...defaultConfig, isChartShow: true }
    applyConfigUpdate(original, 'isChartShow', false as any)
    expect(original.isChartShow).toBe(true)
  })

  it('preserves other keys when updating one', () => {
    const result = applyConfigUpdate(defaultConfig, 'isShowEmptyCategories', true as any)
    expect(result).not.toBeNull()
    expect(result!.isShowEmptyCategories).toBe(true)
    expect(result!.chartType).toBe('bar')
    expect(result!.catsList).toEqual(defaultConfig.catsList)
  })
})
