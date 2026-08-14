import { describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'

import { chartPanDistance, chartWheelPanDistance, useStatChartPan } from './useStatChartPan'

vi.stubGlobal('shallowRef', shallowRef)
vi.stubGlobal('onScopeDispose', () => {})

function pointer(type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number, clientY = 0) {
  return {
    button: 0,
    clientX,
    clientY,
    currentTarget: {
      hasPointerCapture: () => false,
      releasePointerCapture: () => {},
      setPointerCapture: () => {},
    },
    pointerId: 1,
    preventDefault: () => {},
    type,
  } as unknown as PointerEvent
}

describe('useStatChartPan', () => {
  it('pans to the past after a horizontal drag and consumes its click', () => {
    const pan = vi.fn(() => true)
    const chartPan = useStatChartPan({ canPan: () => true, pan })

    chartPan.onPointerDown(pointer('pointerdown', 0))
    chartPan.onPointerMove(pointer('pointermove', chartPanDistance + 1))
    chartPan.onPointerEnd(pointer('pointerup', chartPanDistance + 1))

    expect(pan).toHaveBeenCalledWith('past')
    expect(chartPan.consumeClick()).toBe(true)
    expect(chartPan.consumeClick()).toBe(false)
  })

  it('does not pan for a vertical drag or ordinary vertical wheel', () => {
    const pan = vi.fn(() => true)
    const chartPan = useStatChartPan({ canPan: () => true, pan })

    chartPan.onPointerDown(pointer('pointerdown', 0, 0))
    chartPan.onPointerMove(pointer('pointermove', 2, chartPanDistance + 1))
    chartPan.onWheel({
      deltaX: 0,
      deltaY: chartWheelPanDistance,
      preventDefault: () => {},
      shiftKey: false,
    } as WheelEvent)

    expect(pan).not.toHaveBeenCalled()
  })

  it('uses the same pan action for keyboard arrows', () => {
    const pan = vi.fn(() => true)
    const chartPan = useStatChartPan({ canPan: () => true, pan })

    chartPan.onKeyDown({
      key: 'ArrowLeft',
      preventDefault: () => {},
    } as KeyboardEvent)
    chartPan.onKeyDown({
      key: 'ArrowRight',
      preventDefault: () => {},
    } as KeyboardEvent)

    expect(pan).toHaveBeenNthCalledWith(1, 'past')
    expect(pan).toHaveBeenNthCalledWith(2, 'future')
  })
})
