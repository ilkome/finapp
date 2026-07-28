import type { Range } from '~~/utils/date/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'

import type { StatDateParams } from '~/components/stat/date/types'

import { defaultStatDateParams } from './params'

// Stub Nuxt auto-imports
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('watch', watch)

// Stub localStorage for useStorage
vi.stubGlobal('localStorage', {
  getItem: () => null,
  removeItem: vi.fn(),
  setItem: vi.fn(),
})

// Mock useStorage as a plain ref with defaults
vi.mock('@vueuse/core', () => ({
  useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
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

describe('setGranularityBy', () => {
  it('changes granularityBy and resets custom params', () => {
    const statDate = createStatDate({
      granularityBy: 'day',
      isShowMaxRange: true,
      isSkipEmpty: true,
    })

    statDate.setGranularityBy('week')

    expect(statDate.params.value.granularityBy).toBe('week')
    expect(statDate.params.value.isShowMaxRange).toBe(false)
    expect(statDate.params.value.isSkipEmpty).toBe(false)
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

    const statDate = useStatDateWithStalePayload({ key: 'stale-test', maxRange })

    expect(statDate.params.value.granularityBy).toBe(defaultStatDateParams.granularityBy)
    expect(statDate.params.value.granularityDuration).toBe(defaultStatDateParams.granularityDuration)
    expect(() => statDate.intervalsInRange.value).not.toThrow()
    expect(() => statDate.range.value).not.toThrow()
  })
})
