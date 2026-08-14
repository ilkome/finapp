import type { StatRangePanDirection } from '~/components/stat/date/useStatDate'

export const chartPanDistance = 32
export const chartWheelPanDistance = 48
export const chartWheelPanResetMs = 180

type UseStatChartPanParams = {
  canPan: (direction: StatRangePanDirection) => boolean
  pan: (direction: StatRangePanDirection) => boolean
}

export function useStatChartPan(params: UseStatChartPanParams) {
  const isDragging = shallowRef(false)
  let pointerId: number | null = null
  let pointerStartX = 0
  let pointerStartY = 0
  let pointerLastX = 0
  let pointerDirection: 'horizontal' | 'vertical' | null = null
  let pointerDistance = 0
  let wheelDistance = 0
  let wheelResetTimer: ReturnType<typeof setTimeout> | undefined
  let shouldConsumeClick = false

  function pan(direction: StatRangePanDirection) {
    if (!params.canPan(direction))
      return false
    return params.pan(direction)
  }

  function consumeDistance(distance: number) {
    pointerDistance += distance
    while (Math.abs(pointerDistance) >= chartPanDistance) {
      const direction: StatRangePanDirection = pointerDistance > 0 ? 'past' : 'future'
      pointerDistance -= Math.sign(pointerDistance) * chartPanDistance
      if (!pan(direction)) {
        pointerDistance = 0
        break
      }
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0)
      return
    pointerId = event.pointerId
    pointerStartX = event.clientX
    pointerStartY = event.clientY
    pointerLastX = event.clientX
    pointerDirection = null
    pointerDistance = 0
    isDragging.value = false
  }

  function onPointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId)
      return
    const deltaX = event.clientX - pointerLastX
    const totalX = event.clientX - pointerStartX
    const totalY = event.clientY - pointerStartY

    if (!pointerDirection && Math.max(Math.abs(totalX), Math.abs(totalY)) >= chartPanDistance) {
      pointerDirection = Math.abs(totalX) > Math.abs(totalY) ? 'horizontal' : 'vertical'
      if (pointerDirection === 'horizontal') {
        const target = event.currentTarget as EventTarget & {
          setPointerCapture?: (pointerId: number) => void
        }
        if (typeof target.setPointerCapture === 'function')
          target.setPointerCapture(event.pointerId)
        isDragging.value = true
        shouldConsumeClick = true
      }
    }

    pointerLastX = event.clientX
    if (pointerDirection !== 'horizontal')
      return
    event.preventDefault()
    consumeDistance(deltaX)
  }

  function onPointerEnd(event: PointerEvent) {
    if (pointerId !== event.pointerId)
      return
    const target = event.currentTarget as EventTarget & {
      hasPointerCapture?: (pointerId: number) => boolean
      releasePointerCapture?: (pointerId: number) => void
    }
    if (target.hasPointerCapture?.(event.pointerId) && typeof target.releasePointerCapture === 'function')
      target.releasePointerCapture(event.pointerId)
    pointerId = null
    pointerDirection = null
    pointerDistance = 0
    isDragging.value = false
  }

  function resetWheelDistance() {
    wheelDistance = 0
    wheelResetTimer = undefined
  }

  function onWheel(event: WheelEvent) {
    const delta = event.shiftKey ? event.deltaY : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0
    if (!delta)
      return

    event.preventDefault()
    wheelDistance += delta
    while (Math.abs(wheelDistance) >= chartWheelPanDistance) {
      const direction: StatRangePanDirection = wheelDistance < 0 ? 'past' : 'future'
      wheelDistance -= Math.sign(wheelDistance) * chartWheelPanDistance
      if (!pan(direction)) {
        resetWheelDistance()
        break
      }
    }
    if (wheelResetTimer)
      clearTimeout(wheelResetTimer)
    wheelResetTimer = setTimeout(resetWheelDistance, chartWheelPanResetMs)
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      pan('past')
    }
    else if (event.key === 'ArrowRight') {
      event.preventDefault()
      pan('future')
    }
  }

  function consumeClick() {
    const result = shouldConsumeClick
    shouldConsumeClick = false
    return result
  }

  onScopeDispose(() => {
    if (wheelResetTimer)
      clearTimeout(wheelResetTimer)
  })

  return {
    consumeClick,
    isDragging,
    onKeyDown,
    onPointerDown,
    onPointerEnd,
    onPointerMove,
    onWheel,
  }
}
