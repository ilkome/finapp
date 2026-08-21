import { describe, expect, it } from 'vitest'

import {
  calcOverlayOpacity,
  calcVisiblePercent,
  getRestingInitialY,
  hasDetents,
  resolveDetentFractions,
  resolveDetentRelease,
  shouldCloseClassicSheet,
} from './geometry'

describe('bottom sheet geometry', () => {
  it('normalizes pixel and fractional detents without mutating the input', () => {
    const points = [500, 0.98]

    expect(resolveDetentFractions(points, 1000)).toEqual([0.5, 0.98])
    expect(points).toEqual([500, 0.98])
  })

  it('rejects invalid detent configurations', () => {
    expect(hasDetents(undefined)).toBe(false)
    expect(hasDetents([0.5])).toBe(false)
    expect(hasDetents([0, 1])).toBe(false)
    expect(resolveDetentFractions([0.5], 1000)).toEqual([])
  })

  it('clamps detents to the supported viewport range', () => {
    expect(resolveDetentFractions([10, 2000], 1000)).toEqual([0.05, 1])
  })

  it('calculates resting offsets and visibility', () => {
    expect(getRestingInitialY(0.5, 1, 800)).toBe(-400)
    expect(calcVisiblePercent(400, 16, 216)).toBe(50)
    expect(calcOverlayOpacity(50)).toBe(0.5)
    expect(calcOverlayOpacity(120)).toBe(1)
  })

  it('resolves classic and detent release thresholds', () => {
    expect(shouldCloseClassicSheet(60, 60, 'down')).toBe(true)
    expect(shouldCloseClassicSheet(100, 60, 'up')).toBe(false)
    expect(shouldCloseClassicSheet(30, 60, 'down', 0.7)).toBe(true)
    expect(shouldCloseClassicSheet(8, 60, 'down', 0.7)).toBe(false)
    expect(shouldCloseClassicSheet(30, 60, 'up', 0.7)).toBe(false)
    expect(resolveDetentRelease(80, 0, 0, 60)).toBe('close')
    expect(resolveDetentRelease(10, 80, 0, 60)).toBe('expand')
    expect(resolveDetentRelease(20, 0, 0, 60)).toBe('restore')
    expect(resolveDetentRelease(10, 0, 0.7, 60)).toBe('close')
  })
})
