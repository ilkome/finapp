import type { MaybeRefOrGetter } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, toValue, watch } from 'vue'

import { defaultConfig } from './schema'

const storageKeys = vi.hoisted(() => [] as unknown[])
const storageState = vi.hoisted(() => new Map<string, unknown>())
const currentRoute = ref({ query: {} as Record<string, string> })

vi.stubGlobal('localStorage', {})
vi.stubGlobal('useIsLaptop', () => ref(true))
vi.stubGlobal('useRouter', () => ({ currentRoute }))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: unknown, defaultValue: unknown) => {
    const storageKey = String(toValue(key))
    const storageRef = key as { value?: string }
    storageKeys.push(storageRef)
    const initialValue = storageState.has(storageKey) ? storageState.get(storageKey) : defaultValue
    const state = ref(initialValue)
    watch(state, (value) => {
      storageState.set(storageKey, value)
    })
    return state
  },
}))

const { normalizeStoredStatConfig, useStatConfig } = await import('./useStatConfig')

beforeEach(() => {
  currentRoute.value = { query: {} }
  storageKeys.length = 0
  storageState.clear()
})

describe('normalizeStoredStatConfig', () => {
  it('preserves the current pie chart type in partial stored configs', () => {
    const config = normalizeStoredStatConfig({ chart: { type: 'pie' } }, structuredClone(defaultConfig))

    expect(config.chart.type).toBe('pie')
  })

  it('migrates legacy chart and tab view settings', () => {
    const config = normalizeStoredStatConfig({ chart: { isByCategories: true, type: 'line' } }, structuredClone(defaultConfig), 'split')

    expect(config.chart).toMatchObject({ breakdown: 'categories', layout: 'split', type: 'line' })
    expect(config.page.layout).toBe('split')
  })

  it('defaults independent layouts for non-split legacy tabs', () => {
    const config = normalizeStoredStatConfig({ chart: { isByCategories: false } }, structuredClone(defaultConfig), 'summary')

    expect(config.chart).toMatchObject({ breakdown: 'cashflow', layout: 'combined-wide' })
    expect(config.page.layout).toBe('combined')
  })

  it('backfills the current chart value display for stored configs', () => {
    const config = normalizeStoredStatConfig({ chart: { type: 'line' } }, structuredClone(defaultConfig))

    expect(config.chart.valueDisplay).toBe('magnitude')
    expect(config.chart.isShowScale).toBe(false)
    expect(config.chart.line).toEqual({ isGradient: false, isShowPoints: true, isSkipZero: false, isSmooth: true })
    expect(config.categories.round.isInlineAmount).toBe(false)
  })

  it('migrates removed line chart variants to line options', () => {
    const area = normalizeStoredStatConfig({ chart: { type: 'area' } }, structuredClone(defaultConfig))
    const sharp = normalizeStoredStatConfig({ chart: { type: 'stackedLine' } }, structuredClone(defaultConfig))

    expect(area.chart).toMatchObject({
      line: { isGradient: true, isShowPoints: true, isSkipZero: false, isSmooth: false },
      type: 'line',
    })
    expect(sharp.chart).toMatchObject({
      line: { isGradient: false, isShowPoints: false, isSkipZero: false, isSmooth: false },
      type: 'line',
    })
  })

  it('tracks a reactive page storage key', () => {
    const pageStorageKey = ref('dashboard-summary')

    useStatConfig({ storageKey: pageStorageKey })

    const storageKey = storageKeys.at(-1) as MaybeRefOrGetter<string>
    expect(toValue(storageKey)).toBe('finapp-dashboard-summary-')

    pageStorageKey.value = 'dashboard-expense'
    expect(toValue(storageKey)).toBe('finapp-dashboard-expense-')
  })

  it('uses initialConfig even if storage has a different valid value', () => {
    const storedValue = structuredClone(defaultConfig)
    storedValue.chart.type = 'line'
    storageState.set('finapp-dashboard-summary-', storedValue)

    const statConfig = useStatConfig({
      initialConfig: { ...defaultConfig, chart: { ...defaultConfig.chart, type: 'pie' } },
      storageKey: 'dashboard-summary',
    })

    expect(statConfig.config.value.chart.type).toBe('pie')
  })
})
