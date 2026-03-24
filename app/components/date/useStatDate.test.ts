import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref, watch } from 'vue'

import type { Range, StatDateParams } from '~/components/date/types'

import { defaultStatDateParams } from './statDateParams'

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
      intervalsBy: 'month',
      intervalsDuration: 1,
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

describe('setIntervalsBy', () => {
  it('changes intervalsBy and resets custom params', () => {
    const statDate = createStatDate({
      intervalsBy: 'day',
      isShowMaxRange: true,
      isSkipEmpty: true,
    })

    statDate.setIntervalsBy('week')

    expect(statDate.params.value.intervalsBy).toBe('week')
    expect(statDate.params.value.isShowMaxRange).toBe(false)
    expect(statDate.params.value.isSkipEmpty).toBe(false)
  })
})
