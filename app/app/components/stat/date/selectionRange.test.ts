import { describe, expect, it } from 'vitest'

import { resolveStatSelectionRange, resolveStatSelectionSourceRange } from './selectionRange'

describe('resolveStatSelectionRange', () => {
  const range = { end: 10, start: 1 }
  const selectedInterval = { end: 6, start: 4 }

  it('uses the selected chart interval for statistics context', () => {
    expect(resolveStatSelectionRange(range, selectedInterval, 2)).toBe(selectedInterval)
  })

  it('uses the full range when no chart interval is selected', () => {
    expect(resolveStatSelectionRange(range, selectedInterval, -1)).toBe(range)
  })

  it('falls back to the full range while a selected interval is unavailable', () => {
    expect(resolveStatSelectionRange(range, undefined, 2)).toBe(range)
  })

  it('keeps the selection source unbounded in maximum-range mode', () => {
    expect(resolveStatSelectionSourceRange(range, selectedInterval, 2, true)).toBeUndefined()
  })

  it('bounds the selection source outside maximum-range mode', () => {
    expect(resolveStatSelectionSourceRange(range, selectedInterval, 2, false)).toBe(selectedInterval)
  })
})
