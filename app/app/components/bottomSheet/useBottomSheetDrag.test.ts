// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'

import { isSheetDragExcludedTarget } from './useBottomSheetDrag'

describe('bottom sheet drag targets', () => {
  it('does not start a sheet drag from a sorting handle or its icon', () => {
    const handle = document.createElement('div')
    const icon = document.createElement('span')
    handle.className = 'sortHandle'
    handle.append(icon)

    expect(isSheetDragExcludedTarget(handle)).toBe(true)
    expect(isSheetDragExcludedTarget(icon)).toBe(true)
    expect(isSheetDragExcludedTarget(document.createElement('div'))).toBe(false)
  })
})
