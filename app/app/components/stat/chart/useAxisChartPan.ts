import type { Ref } from 'vue'

type DataZoomEvent = {
  batch?: Array<{ end?: number, endValue?: number, start?: number, startValue?: number }>
  end?: number
  endValue?: number
  start?: number
  startValue?: number
}

export function useAxisChartPan({
  chartRef,
  emit,
  getEndValue,
  getStartValue,
  getXAxisLabels,
  isPannable,
}: {
  chartRef: Ref<any>
  emit: {
    (event: 'click', intervalKey: number): void
    (event: 'preview', startValue: number, endValue: number): void
    (event: 'previewEnd'): void
  }
  getEndValue: () => number | undefined
  getStartValue: () => number | undefined
  getXAxisLabels: () => number[]
  isPannable: () => boolean
}) {
  let pointerStartX = 0
  let pointerStartY = 0
  let pointerId: number | undefined
  let consumeNextClick = false
  let wheelDistance = 0

  const visibleBucketCount = computed(() => {
    const xAxisLabels = getXAxisLabels()
    const startIndex = xAxisLabels.indexOf(getStartValue() ?? -1)
    const endIndex = xAxisLabels.indexOf(getEndValue() ?? -1)
    return startIndex >= 0 && endIndex >= startIndex ? endIndex - startIndex + 1 : xAxisLabels.length
  })

  function valueFromPercent(percent: number | undefined, fallback: number | undefined) {
    const xAxisLabels = getXAxisLabels()
    if (fallback !== undefined && xAxisLabels.includes(fallback))
      return fallback
    if (fallback !== undefined && Number.isInteger(fallback) && fallback >= 0 && fallback < xAxisLabels.length)
      return xAxisLabels[fallback]
    if (percent === undefined || !xAxisLabels.length)
      return undefined
    return xAxisLabels[Math.round((Math.max(0, Math.min(100, percent)) / 100) * (xAxisLabels.length - 1))]
  }

  function onDataZoom(event: unknown) {
    const dataZoomEvent = event as DataZoomEvent
    const payload = dataZoomEvent.batch?.[0] ?? dataZoomEvent
    const nextStartValue = valueFromPercent(payload.start, payload.startValue)
    const nextEndValue = valueFromPercent(payload.end, payload.endValue)
    if (nextStartValue !== undefined && nextEndValue !== undefined)
      emit('preview', nextStartValue, nextEndValue)
  }

  function moveViewport(delta: number) {
    const startValue = getStartValue()
    const endValue = getEndValue()
    if (!isPannable() || startValue === undefined || endValue === undefined)
      return false
    const xAxisLabels = getXAxisLabels()
    const startIndex = xAxisLabels.indexOf(startValue)
    const endIndex = xAxisLabels.indexOf(endValue)
    const nextStartIndex = startIndex + delta
    const nextEndIndex = endIndex + delta
    if (startIndex < 0 || endIndex < 0 || nextStartIndex < 0 || nextEndIndex >= xAxisLabels.length)
      return false
    const nextStart = xAxisLabels[nextStartIndex]!
    const nextEnd = xAxisLabels[nextEndIndex]!
    chartRef.value?.dispatchAction({
      dataZoomId: 'stat-window',
      endValue: nextEndIndex,
      startValue: nextStartIndex,
      type: 'dataZoom',
    })
    emit('preview', nextStart, nextEnd)
    return true
  }

  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
    if (!delta || !moveViewport(delta))
      return
    event.preventDefault()
    emit('previewEnd')
  }

  function onWheel(event: WheelEvent) {
    const delta = event.shiftKey ? event.deltaY : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0
    event.stopPropagation()
    if (!delta)
      return
    event.preventDefault()
    wheelDistance += delta
    if (Math.abs(wheelDistance) < 48)
      return
    const moved = moveViewport(wheelDistance > 0 ? 1 : -1)
    wheelDistance = 0
    if (moved)
      emit('previewEnd')
  }

  function onPointerDown(event: PointerEvent) {
    pointerId = event.pointerId
    pointerStartX = event.clientX
    pointerStartY = event.clientY
    consumeNextClick = false
  }

  function onPointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId)
      return
    if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 6)
      consumeNextClick = true
  }

  function onPointerEnd(event: PointerEvent) {
    if (pointerId !== event.pointerId)
      return
    pointerId = undefined
  }

  function onClickChart(params: { offsetX: number, offsetY: number }) {
    if (consumeNextClick) {
      consumeNextClick = false
      return
    }
    const xAxisLabels = getXAxisLabels()
    const [axisValue] = chartRef.value.convertFromPixel('grid', [params.offsetX, params.offsetY])
    const intervalKey = xAxisLabels.includes(axisValue) ? axisValue : xAxisLabels[Math.round(axisValue)]
    if (intervalKey !== undefined)
      emit('click', intervalKey)
  }

  return {
    onClickChart,
    onDataZoom,
    onKeyDown,
    onPointerDown,
    onPointerEnd,
    onPointerMove,
    onWheel,
    visibleBucketCount,
  }
}
