import type { MaybeRefOrGetter } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, toValue } from 'vue'

import { defaultConfig } from './schema'

const storageKeys = vi.hoisted(() => [] as unknown[])
const currentRoute = ref({ query: {} as Record<string, string> })

vi.stubGlobal('localStorage', {})
vi.stubGlobal('useIsLaptop', () => ref(true))
vi.stubGlobal('useRouter', () => ({ currentRoute }))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: unknown, defaultValue: unknown) => {
    storageKeys.push(key)
    return ref(defaultValue)
  },
}))

const { normalizeStoredStatConfig, useStatConfig } = await import('./useStatConfig')

beforeEach(() => {
  currentRoute.value = { query: {} }
  storageKeys.length = 0
})

describe('normalizeStoredStatConfig', () => {
  it('maps legacy pie chart configs to bar', () => {
    const config = normalizeStoredStatConfig({ chart: { type: 'pie' } }, structuredClone(defaultConfig))

    expect(config.chart.type).toBe('bar')
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

  it('tracks a reactive page storage key', () => {
    const pageStorageKey = ref('dashboard-summary')

    useStatConfig({ storageKey: pageStorageKey })

    const storageKey = storageKeys.at(-1) as MaybeRefOrGetter<string>
    expect(toValue(storageKey)).toBe('finapp-dashboard-summary-')

    pageStorageKey.value = 'dashboard-expense'
    expect(toValue(storageKey)).toBe('finapp-dashboard-expense-')
  })
})
