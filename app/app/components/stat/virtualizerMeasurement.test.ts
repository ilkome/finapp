import type { VirtualizerOptions } from '@tanstack/vue-virtual'

import { Virtualizer } from '@tanstack/vue-virtual'
import { describe, expect, it } from 'vitest'

function options(count: number, scrollMargin: number): VirtualizerOptions<Window, Element> {
  return {
    count,
    estimateSize: () => 50,
    getItemKey: index => `row:${index}`,
    getScrollElement: () => null,
    observeElementOffset: () => () => {},
    observeElementRect: () => () => {},
    scrollMargin,
    scrollToFn: () => {},
  }
}

describe('tanStack dynamic measurements', () => {
  it('preserves measured sizes across append and external geometry updates', () => {
    const virtualizer = new Virtualizer(options(3, 100))
    virtualizer.getTotalSize()
    virtualizer.resizeItem(0, 84)
    virtualizer.resizeItem(1, 124)

    virtualizer.setOptions(options(4, 180))
    expect(virtualizer.getTotalSize()).toBe(308)
    const measurements = virtualizer.takeSnapshot()

    expect(measurements[0]?.size).toBe(84)
    expect(measurements[1]?.size).toBe(124)
    expect(measurements[0]?.start).toBe(180)
  })
})
