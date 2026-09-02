import type { MaybeRefOrGetter } from 'vue'
import type { Range } from '~~/utils/date/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, shallowRef, toValue, watch } from 'vue'

import type { StatDateParams } from '~/components/stat/date/types'

import { defaultStatDateParams } from './params'

// Stub Nuxt auto-imports
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('shallowRef', shallowRef)
vi.stubGlobal('watch', watch)

// Stub localStorage for useStorage
vi.stubGlobal('localStorage', {
  getItem: () => null,
  removeItem: vi.fn(),
  setItem: vi.fn(),
})

const storageKeys = vi.hoisted(() => [] as unknown[])
const storedValues = vi.hoisted(() => [] as unknown[])

// Mock useStorage as a plain ref with defaults
vi.mock('@vueuse/core', () => ({
  useStorage: (key: unknown, defaultValue: any) => {
    storageKeys.push(key)
    return ref(storedValues.shift() ?? defaultValue)
  },
}))

const { useStatDate } = await import('./useStatDate')

function createStatDate(overrides?: Partial<StatDateParams>) {
  const maxRange = computed<Range>(() => ({
    end: new Date('2024-12-31').getTime(),
    start: new Date('2024-01-01').getTime(),
  }))

  const statDate = useStatDate({ key: `test-${Math.random()}`, maxRange })

  Object.assign(statDate.params.value, defaultStatDateParams, overrides)

  return statDate
}

describe('selectInterval', () => {
  let statDate: ReturnType<typeof createStatDate>

  beforeEach(() => {
    statDate = createStatDate({
      granularityBy: 'month',
      granularityDuration: 1,
      intervalSelected: -1,
      rangeBy: 'year',
      rangeDuration: 1,
      rangeOffset: 0,
    })
  })

  it('selects interval and returns start date', () => {
    const result = statDate.selectInterval(2)

    expect(statDate.params.value.intervalSelected).toBe(2)
    expect(result).toBeDefined()
  })

  it('deselects interval on repeated click', () => {
    statDate.selectInterval(2)
    expect(statDate.params.value.intervalSelected).toBe(2)

    const result = statDate.selectInterval(2)
    expect(statDate.params.value.intervalSelected).toBe(-1)
    expect(result).toBeUndefined()
  })

  it('switches to different interval without deselecting', () => {
    statDate.selectInterval(1)
    expect(statDate.params.value.intervalSelected).toBe(1)

    statDate.selectInterval(3)
    expect(statDate.params.value.intervalSelected).toBe(3)
  })

  it('returns undefined for out-of-range index', () => {
    const result = statDate.selectInterval(999)

    expect(statDate.params.value.intervalSelected).toBe(999)
    expect(result).toBeUndefined()
  })
})

describe('storage key', () => {
  it('tracks a reactive page storage key', () => {
    const pageStorageKey = ref('wallet-summary')
    const maxRange = computed<Range>(() => ({
      end: new Date('2024-12-31').getTime(),
      start: new Date('2024-01-01').getTime(),
    }))

    useStatDate({ key: pageStorageKey, maxRange })

    const storageKey = storageKeys.at(-1) as MaybeRefOrGetter<string>
    expect(toValue(storageKey)).toBe('wallet-summary-params')

    pageStorageKey.value = 'wallet-expense'
    expect(toValue(storageKey)).toBe('wallet-expense-params')
  })
})

describe('initial params', () => {
  it('overrides a previous stored period when requested', () => {
    storedValues.push({
      ...defaultStatDateParams,
      rangeBy: 'year',
      rangeDuration: 1,
    })
    const maxRange = computed<Range>(() => ({
      end: new Date('2024-12-31').getTime(),
      start: new Date('2024-01-01').getTime(),
    }))

    const statDate = useStatDate({
      initParams: {
        ...defaultStatDateParams,
        rangeBy: 'month',
        rangeDuration: 1,
      },
      key: 'snapshot-period',
      maxRange,
      overrideStoredWithInitParams: true,
    })

    expect(statDate.params.value.rangeBy).toBe('month')
    expect(statDate.params.value.rangeDuration).toBe(1)
  })
})

describe('stepInterval', () => {
  it('steps within the range without touching rangeOffset', () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      granularityDuration: 1,
      intervalSelected: 14,
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    })

    statDate.stepInterval(-1)

    expect(statDate.params.value.intervalSelected).toBe(13)
    expect(statDate.params.value.rangeOffset).toBe(0)
  })

  it('rolls back into the previous month landing on its last day', async () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      granularityDuration: 1,
      intervalSelected: 0,
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    })

    statDate.stepInterval(-1)
    await nextTick()

    expect(statDate.params.value.rangeOffset).toBe(1)
    expect(statDate.params.value.intervalSelected).toBe(statDate.intervalsInRange.value.length - 1)
  })

  it('rolls forward into the next month landing on its first day', async () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      granularityDuration: 1,
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 1,
    })
    statDate.params.value.intervalSelected = statDate.intervalsInRange.value.length - 1

    statDate.stepInterval(1)
    await nextTick()

    expect(statDate.params.value.rangeOffset).toBe(0)
    expect(statDate.params.value.intervalSelected).toBe(0)
  })

  it('rolls back into the previous year landing on December when stepping months', async () => {
    const statDate = createStatDate({
      granularityBy: 'month',
      granularityDuration: 1,
      intervalSelected: 0,
      rangeBy: 'year',
      rangeDuration: 1,
      rangeOffset: 0,
    })

    statDate.stepInterval(-1)
    await nextTick()

    expect(statDate.params.value.rangeOffset).toBe(1)
    expect(statDate.params.value.intervalSelected).toBe(11)
  })

  it('leaves other range-changing paths resetting intervalSelected to -1', async () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      granularityDuration: 1,
      intervalSelected: 5,
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    })

    statDate.plusRange()
    await nextTick()

    expect(statDate.params.value.intervalSelected).toBe(-1)
  })
})

describe('range invalidation', () => {
  it('keeps the selected interval when transactions update without changing the date range', async () => {
    const maxRange = shallowRef<Range>({
      end: new Date('2024-12-31').getTime(),
      start: new Date('2024-01-01').getTime(),
    })
    const statDate = useStatDate({
      key: `max-range-test-${Math.random()}`,
      maxRange: computed(() => maxRange.value),
    })
    Object.assign(statDate.params.value, defaultStatDateParams, {
      granularityBy: 'week',
      granularityDuration: 1,
      rangeBy: 'day',
      rangeDuration: 30,
      rangeOffset: 0,
    })
    await nextTick()

    const rangeBeforeUpdate = { ...statDate.range.value }
    const penultimateInterval = statDate.intervalsInRange.value.length - 2
    statDate.params.value.intervalSelected = penultimateInterval

    maxRange.value = {
      end: new Date('2025-01-01').getTime(),
      start: new Date('2023-12-31').getTime(),
    }
    await nextTick()

    expect(statDate.range.value).toEqual(rangeBeforeUpdate)
    expect(statDate.params.value.intervalSelected).toBe(penultimateInterval)
  })
})

describe('setGranularityBy', () => {
  it('changes grouping without resetting the selected maximum range', () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      intervalSelected: 4,
      isShowMaxRange: true,
      isSkipEmpty: true,
    })

    statDate.setGranularityBy('week')

    expect(statDate.params.value.granularityBy).toBe('week')
    expect(statDate.params.value.intervalSelected).toBe(-1)
    expect(statDate.params.value.isShowMaxRange).toBe(true)
    expect(statDate.params.value.isSkipEmpty).toBe(true)
  })

  it('preserves maximum range when changing grouping and its duration', () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      granularityDuration: 1,
      isShowMaxRange: true,
      rangeBy: 'day',
      rangeDuration: 365,
    })

    statDate.setGranularity({ granularityBy: 'month', granularityDuration: 1 })
    statDate.plusGranularity()

    expect(statDate.params.value.granularityBy).toBe('month')
    expect(statDate.params.value.granularityDuration).toBe(2)
    expect(statDate.params.value.isShowMaxRange).toBe(true)
    expect(statDate.params.value.rangeBy).toBe('day')
    expect(statDate.params.value.rangeDuration).toBe(365)
  })

  it('sets grouping duration directly and keeps maximum range active', () => {
    const statDate = createStatDate({
      granularityDuration: 1,
      intervalSelected: 4,
      isShowMaxRange: true,
    })

    statDate.setGranularityDuration(3)

    expect(statDate.params.value.granularityDuration).toBe(3)
    expect(statDate.params.value.intervalSelected).toBe(-1)
    expect(statDate.params.value.isShowMaxRange).toBe(true)
  })

  it('sets range duration directly and exits maximum range', () => {
    const statDate = createStatDate({
      isShowMaxRange: true,
      rangeBy: 'month',
      rangeDuration: 3,
      rangeOffset: 2,
    })

    statDate.setRangeDuration(4)

    expect(statDate.params.value.isShowMaxRange).toBe(false)
    expect(statDate.params.value.rangeBy).toBe('month')
    expect(statDate.params.value.rangeDuration).toBe(4)
    expect(statDate.params.value.rangeOffset).toBe(0)
  })
})

describe('scroll range override', () => {
  it('changes the effective range without persisting rangeOffset', () => {
    const statDate = createStatDate({
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    })

    const baseStart = statDate.range.value.start

    statDate.setScrollRangeOffset(1)

    expect(statDate.params.value.rangeOffset).toBe(0)
    expect(statDate.effectiveParams.value.rangeOffset).toBe(1)
    expect(statDate.range.value.start).not.toBe(baseStart)
    expect(statDate.isScrollRangeOverridden.value).toBe(true)
  })

  it('clears the scroll override after a manual period change', async () => {
    const statDate = createStatDate({
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    })

    statDate.setScrollRangeOffset(1)
    statDate.params.value.rangeOffset = 2
    await nextTick()

    expect(statDate.scrollRangeOffset.value).toBe(null)
    expect(statDate.effectiveParams.value.rangeOffset).toBe(2)
    expect(statDate.isScrollRangeOverridden.value).toBe(false)
  })
})

describe('range panning', () => {
  it('moves by one chart interval, clears selection, and returns home', () => {
    const statDate = createStatDate({
      granularityBy: 'month',
      granularityDuration: 1,
      intervalSelected: 3,
      rangeBy: 'year',
      rangeDuration: 1,
      rangeOffset: 0,
    })
    const initialRange = { ...statDate.range.value }

    expect(statDate.panRange('past')).toBe(true)
    expect(statDate.params.value.rangePanOffset).toBe(1)
    expect(statDate.params.value.intervalSelected).toBe(-1)
    expect(statDate.range.value.start).toBeLessThan(initialRange.start)

    statDate.goHome()
    expect(statDate.params.value.rangePanOffset).toBe(0)
    expect(statDate.range.value).toEqual(initialRange)
  })

  it('resets a fine pan when changing granularity or range duration', () => {
    const statDate = createStatDate({ rangePanOffset: 4 })

    statDate.setGranularityBy('week')
    expect(statDate.params.value.rangePanOffset).toBe(0)

    statDate.params.value.rangePanOffset = 4
    statDate.plusRange()
    expect(statDate.params.value.rangePanOffset).toBe(0)
  })

  it('commits a multi-bucket pan atomically and clamps it to history', () => {
    const statDate = createStatDate({
      granularityBy: 'month',
      granularityDuration: 1,
      intervalSelected: 3,
      rangeBy: 'year',
      rangeDuration: 1,
      rangeOffset: 0,
    })
    statDate.setScrollRangeOffset(2)

    expect(statDate.setRangePanOffset(5)).toBe(true)
    expect(statDate.params.value.rangePanOffset).toBe(5)
    expect(statDate.params.value.intervalSelected).toBe(-1)
    expect(statDate.scrollRangeOffset.value).toBeNull()

    expect(statDate.setRangePanOffset(10_000)).toBe(true)
    expect(statDate.range.value.start).toBeGreaterThanOrEqual(statDate.maxRange.value.start)
  })

  it('does not pan beyond the latest range or in maximum-history mode', () => {
    const statDate = createStatDate()
    expect(statDate.setRangePanOffset(-1)).toBe(false)
    expect(statDate.params.value.rangePanOffset).toBe(0)

    statDate.params.value.isShowMaxRange = true
    expect(statDate.setRangePanOffset(1)).toBe(false)
  })
})

describe('stale persisted payload (pre granularityBy rename)', () => {
  it('backfills granularity defaults and does not throw when reading range/intervals', async () => {
    // Simulates a payload persisted before the intervalsBy -> granularityBy rename: it still
    // has the old keys but never had granularityBy/granularityDuration written to storage.
    const stalePayload = {
      customDate: false,
      intervalsBy: 'month',
      intervalsDuration: 1,
      intervalSelected: -1,
      isShowMaxRange: false,
      isSkipEmpty: false,
      rangeBy: 'year',
      rangeDuration: 1,
      rangeOffset: 0,
    } as unknown as StatDateParams

    vi.resetModules()
    vi.doMock('@vueuse/core', () => ({
      useStorage: (_key: string, _defaultValue: any) => ref(stalePayload),
    }))

    const { useStatDate: useStatDateWithStalePayload } = await import('./useStatDate')

    const maxRange = computed<Range>(() => ({
      end: new Date('2024-12-31').getTime(),
      start: new Date('2024-01-01').getTime(),
    }))

    const statDate = useStatDateWithStalePayload({
      key: 'stale-test',
      maxRange,
    })

    expect(statDate.params.value.granularityBy).toBe(defaultStatDateParams.granularityBy)
    expect(statDate.params.value.granularityDuration).toBe(defaultStatDateParams.granularityDuration)
    expect(() => statDate.intervalsInRange.value).not.toThrow()
    expect(() => statDate.range.value).not.toThrow()
  })
})
