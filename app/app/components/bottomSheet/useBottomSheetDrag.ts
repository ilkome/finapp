import type { Ref } from 'vue'

import {
  calcOverlayOpacity,
  calcVisiblePercent,
  EXPANDED_DETENT_EPSILON,
  getRestingInitialY,
  hasDetents,
  PERCENT_BASE,
  resolveDetentFractions,
  resolveDetentRelease,
  shouldCloseClassicSheet,
} from './geometry'

type DragInputEvent = TouchEvent | MouseEvent
type SheetPhase = 'closed' | 'opening' | 'idle' | 'pending' | 'dragging' | 'closing'

type UseBottomSheetDragParams = {
  containerRef: Ref<HTMLElement | null>
  drag: Ref<HTMLElement | null>
  dragStyle: Ref<Record<string, string> | undefined>
  emit: (event: 'closed') => void
  expanded: Ref<boolean | undefined>
  handlerRef: Ref<HTMLElement | null>
  settings: {
    pixelOffsetToStartClosing: number
    pixelsNeedToDragForClose: number
  }
  // Detent sizes as viewport fractions (<= 1) or absolute pixels (> 1); the
  // largest is the expanded/rendered height, the rest are collapsed detents.
  // Absent => classic single-state sheet.
  snapPoints?: Ref<number[] | undefined>
  windowHeight: Ref<number>
}

// Controls whose first tap must not be consumed by the drag gesture. Plain
// `div @click` rows are intentionally excluded so drag/scroll still starts on them.
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, label, [role="button"], [role="tab"], [role="switch"]'
const SHEET_DRAG_EXCLUDED_SELECTOR = '.sortHandle, [role="combobox"]'
const TRANSITION_FALLBACK_MS = 150

function getClientY(event: DragInputEvent): number {
  return 'touches' in event
    ? Math.round(event.touches[0]!.clientY)
    : event.clientY
}

export function useBottomSheetDrag({
  containerRef,
  drag,
  dragStyle,
  emit,
  expanded,
  handlerRef,
  settings,
  snapPoints,
  windowHeight,
}: UseBottomSheetDragParams) {
  const initialY = ref(0)
  const clientY = ref(0)
  const phase = ref<SheetPhase>('closed')
  const isDragging = computed(() => phase.value === 'dragging')
  const opened = computed(() => phase.value !== 'closed')
  const direction = ref<'down' | 'up'>('up')
  const isHandler = ref(false)
  // The finger has moved past a tap threshold this gesture. Used to gate the
  // sheet's `pointer-events-none`: a collapsed detent is always transform-shifted,
  // so keying that off `isDragging` (set on touchstart) would swallow the click
  // of a plain tap on inner controls (e.g. the filter tabs).
  const dragMoved = ref(false)
  const startFingerY = ref(0)
  const MOVE_THRESHOLD = 8
  let activeScroller: HTMLElement | null = null
  let transitionTimer: ReturnType<typeof setTimeout> | null = null

  function clearTransitionTimer() {
    if (transitionTimer !== null) {
      clearTimeout(transitionTimer)
      transitionTimer = null
    }
  }

  const dragDistance = computed(() => clientY.value - initialY.value)

  // Finger velocity, sampled between drag frames; only read in detent mode.
  const lastMoveY = ref(0)
  const lastMoveT = ref(0)
  const velocity = ref(0)
  // Resting translateY of the detent the current gesture began from, and whether
  // that was the expanded detent - both frozen at drag start so mid-gesture
  // crossings don't flip scroll<->drag arbitration.
  const dragStartOffset = ref(0)
  const startedExpanded = ref(false)

  const detentMode = computed(() => hasDetents(snapPoints?.value))

  // Snap points accept viewport fractions (<= 1) or absolute pixels (> 1),
  // resolved to fractions of the current viewport, clamped and sorted ascending.
  const detentFractions = computed(() => {
    return resolveDetentFractions(snapPoints?.value, windowHeight.value)
  })
  const expandedFraction = computed(() =>
    detentFractions.value[detentFractions.value.length - 1] ?? 1,
  )
  const collapsedFraction = computed(() => detentFractions.value[0] ?? 1)

  // A detent is a resting translateY offset that slides the fixed-height,
  // bottom-anchored `.drag` partly below the screen. To show fraction `f` of the
  // viewport, translate down by (expanded - f) * windowHeight; since at rest
  // clientY=0 and dragDistance = -initialY, that offset is the resting initialY.
  function restingInitialY(f: number): number {
    return getRestingInitialY(f, expandedFraction.value, windowHeight.value)
  }

  // Boolean only in detent mode (true = expanded, false = collapsed); `undefined`
  // for a classic sheet, so consumers keep intrinsic height and normal scrolling
  // instead of the collapsed-detent scroll suppression.
  const isExpanded = computed(() =>
    detentMode.value ? Math.abs(dragDistance.value) <= EXPANDED_DETENT_EPSILON : undefined,
  )

  const dragOffset = computed(() => {
    if (detentMode.value)
      return 0
    return phase.value !== 'dragging' || isHandler.value ? 0 : settings.pixelOffsetToStartClosing
  })

  watch(dragDistance, (current, prev) => {
    direction.value = current > prev ? 'down' : 'up'
  })

  const visiblePercent = computed(() =>
    calcVisiblePercent(
      drag.value?.clientHeight ?? 0,
      handlerRef.value?.clientHeight ?? 0,
      dragDistance.value,
    ),
  )

  const visiblePercentWithOffset = computed(() =>
    calcVisiblePercent(
      drag.value?.clientHeight ?? 0,
      handlerRef.value?.clientHeight ?? 0,
      dragDistance.value - dragOffset.value,
    ),
  )

  const overlayStyles = computed(() => {
    // Detent mode: keep the backdrop fully dim across the collapsed<->expanded
    // range; fade only when dragged below the collapsed detent toward dismissal.
    if (detentMode.value) {
      const collapsedOffset = -restingInitialY(collapsedFraction.value)
      const closedOffset
        = (drag.value?.clientHeight ?? 0) + (handlerRef.value?.clientHeight ?? 0)
      const d = Math.max(0, dragDistance.value)
      if (d <= collapsedOffset)
        return { opacity: 1 }
      const span = Math.max(1, closedOffset - collapsedOffset)
      return { opacity: Math.min(1, Math.max(0, 1 - (d - collapsedOffset) / span)) }
    }

    if (dragDistance.value <= dragOffset.value)
      return

    let opacity = 1
    if (visiblePercent.value < 0 || visiblePercent.value > PERCENT_BASE) {
      opacity = dragDistance.value <= PERCENT_BASE ? 1 : 0
    }
    else {
      opacity = visiblePercentWithOffset.value >= PERCENT_BASE
        ? 1
        : calcOverlayOpacity(visiblePercentWithOffset.value)
    }

    return { opacity }
  })

  const dragStyles = computed(() => {
    if (!opened.value) {
      // Open with the same small rise + fade as the classic sheet: start 30px
      // below the collapsed resting offset, not fully below the fold. A plain
      // 30px offset would sit above the rest and drop in from the top instead.
      const collapsedOffset = -restingInitialY(collapsedFraction.value)
      const closedTransform = detentMode.value
        ? `translateY(${collapsedOffset + 30}px)`
        : 'translateY(30px)'
      return {
        ...dragStyle.value,
        // How far the sheet is slid below its expanded rest; children (e.g. a
        // pinned footer) counter-translate by this to stay at the screen bottom.
        '--sheet-ty': `${collapsedOffset + 30}px`,
        'opacity': 0,
        'transform': closedTransform,
      }
    }

    // Detent mode follows the finger 1:1 but never lifts above the expanded
    // detent (translateY < 0); an over-drag up hands off to inner scroll.
    if (detentMode.value) {
      const clamped = Math.max(0, dragDistance.value)
      return {
        ...dragStyle.value,
        '--sheet-ty': `${clamped}px`,
        'opacity': 1,
        'transform': clamped === 0 ? '' : `translateY(${clamped}px)`,
      }
    }

    if (dragDistance.value <= dragOffset.value) {
      return {
        ...dragStyle.value,
        opacity: 1,
        transform: '',
      }
    }

    return {
      ...dragStyle.value,
      transform: `translateY(${dragDistance.value - dragOffset.value}px)`,
    }
  })

  function firstVisibleScroller(root: HTMLElement | null | undefined): HTMLElement | null {
    const nodes = root?.querySelectorAll<HTMLElement>('.scroller-block')
    for (const el of nodes ?? []) {
      if (el.offsetParent !== null)
        return el
    }
    return null
  }

  function resolveScroller(target: EventTarget | null): HTMLElement | null {
    if (target instanceof Element) {
      const closest = target.closest<HTMLElement>('.scroller-block')
      if (closest && closest.offsetParent !== null)
        return closest
    }

    const active = drag.value?.querySelector('.swiper-slide-active')
    const swiperSlide = active instanceof HTMLElement && active.offsetParent !== null ? active : null
    return firstVisibleScroller(swiperSlide) ?? firstVisibleScroller(drag.value)
  }

  function contentHasScroll(event: DragInputEvent): boolean {
    // Below the expanded detent the sheet owns the drag (up-drag expands it),
    // so never hand off to inner scroll until fully expanded.
    if (detentMode.value && !isExpanded.value)
      return false

    activeScroller ??= resolveScroller(event.target)
    return Boolean(activeScroller && activeScroller.scrollTop > 0)
  }

  function beginDrag(startY: number, velocityY = startY): void {
    if (detentMode.value) {
      dragStartOffset.value = -initialY.value
      startedExpanded.value = dragStartOffset.value <= EXPANDED_DETENT_EPSILON
    }

    clientY.value = startY
    initialY.value = startY + initialY.value
    startFingerY.value = startY
    dragMoved.value = false
    phase.value = 'dragging'

    lastMoveY.value = velocityY
    lastMoveT.value = performance.now()
    velocity.value = 0
  }

  function onDragStart(event: DragInputEvent): void {
    if (phase.value !== 'idle')
      return

    activeScroller = resolveScroller(event.target)

    if (event.target instanceof Element && event.target.closest(SHEET_DRAG_EXCLUDED_SELECTOR))
      return

    if (event.target instanceof Element) {
      isHandler.value = Boolean(event.target.closest('.handler'))
      const isTarget = event.target.closest('.drag')
      const hasScroll = contentHasScroll(event)

      // Never hijack a tap on an interactive control (e.g. the Apply button in
      // the sheet footer, which sits outside the scroller so `hasScroll` can't
      // guard it). Engaging the drag here swallows the control's first click.
      const interactiveTarget = event.target.closest(INTERACTIVE_SELECTOR)
      const isListOption = interactiveTarget?.getAttribute('role') === 'option'
      if (!isHandler.value && interactiveTarget && !isListOption) {
        // Keep taps native, but arm a pointer drag so a deliberate vertical
        // gesture that starts on a control can still dismiss the sheet.
        if (isTarget && !hasScroll) {
          startFingerY.value = getClientY(event)
          phase.value = 'pending'
        }

        return
      }

      if ((!isTarget || hasScroll) && !isHandler.value) {
        activeScroller = null
        return
      }

      beginDrag(getClientY(event))
    }
  }

  function sampleVelocity(y: number) {
    const now = performance.now()
    const dt = now - lastMoveT.value
    if (dt > 0)
      velocity.value = Math.max(-5, Math.min(5, (y - lastMoveY.value) / dt))
    lastMoveY.value = y
    lastMoveT.value = now
  }

  function onDragging(event: DragInputEvent): void {
    if (phase.value === 'pending') {
      const y = getClientY(event)
      if (Math.abs(y - startFingerY.value) <= MOVE_THRESHOLD)
        return

      if (contentHasScroll(event)) {
        phase.value = 'idle'
        activeScroller = null
        return
      }

      beginDrag(startFingerY.value, y)
    }

    if (phase.value !== 'dragging')
      return

    if (detentMode.value) {
      const y = getClientY(event)
      // From the expanded detent the inner list owns vertical scrolling: hand off
      // as soon as the finger moves up or the list is already scrolled. Only a
      // downward drag at the top edge stays with the sheet (to dismiss).
      if (startedExpanded.value && !isHandler.value
        && (contentHasScroll(event) || y < clientY.value)) {
        phase.value = 'idle'
        initialY.value = 0
        clientY.value = 0
        activeScroller = null
        return
      }
      if (Math.abs(y - startFingerY.value) > MOVE_THRESHOLD)
        dragMoved.value = true
      clientY.value = y
      sampleVelocity(y)
      return
    }

    if (contentHasScroll(event) && !isHandler.value) {
      phase.value = 'idle'
      initialY.value = 0
      clientY.value = 0
      activeScroller = null
      return
    }

    if (isDragging.value) {
      const y = getClientY(event)
      if (Math.abs(y - startFingerY.value) > MOVE_THRESHOLD)
        dragMoved.value = true
      clientY.value = y
      sampleVelocity(y)
    }
  }

  function snapToFraction(f: number) {
    resetDrag()
    phase.value = 'idle'
    initialY.value = restingInitialY(f)
  }

  function snapOnDragEnd() {
    const current = Math.max(0, dragDistance.value)
    const decision = resolveDetentRelease(
      current,
      dragStartOffset.value,
      velocity.value,
      settings.pixelsNeedToDragForClose,
    )

    if (decision === 'close') {
      close()
      return
    }

    if (decision === 'expand') {
      snapToFraction(expandedFraction.value)
      return
    }

    // Too small to commit: settle back onto the detent the gesture began from.
    const startFraction = detentFractions.value.find(
      f => Math.abs(-restingInitialY(f) - dragStartOffset.value) < 0.5,
    ) ?? collapsedFraction.value
    snapToFraction(startFraction)
  }

  function onDragEnd() {
    if (phase.value === 'pending') {
      phase.value = 'idle'
      activeScroller = null
      return
    }

    if (phase.value !== 'dragging')
      return

    if (detentMode.value) {
      snapOnDragEnd()
      return
    }

    if (shouldCloseClassicSheet(
      dragDistance.value,
      settings.pixelsNeedToDragForClose,
      direction.value,
      velocity.value,
    )) {
      close()
    }
    else {
      open()
    }
  }

  function resetDrag() {
    clientY.value = 0
    dragMoved.value = false
    activeScroller = null
  }

  function setInitialY() {
    initialY.value = -(
      (drag.value?.clientHeight ?? 0) + (handlerRef.value?.clientHeight ?? 0)
    )
  }

  function close() {
    if (phase.value === 'closed' || phase.value === 'closing')
      return

    resetDrag()
    clearTransitionTimer()
    phase.value = 'closing'
    setInitialY()
    transitionTimer = setTimeout(finishClose, TRANSITION_FALLBACK_MS)
  }

  function open() {
    resetDrag()
    phase.value = 'idle'
    initialY.value = detentMode.value ? restingInitialY(collapsedFraction.value) : 0
  }

  function finishClose() {
    clearTransitionTimer()
    const scrollerBlocks = drag.value?.querySelectorAll('.scroller-block')
    scrollerBlocks?.forEach(el => (el.scrollTop = 0))
    phase.value = 'closed'
    emit('closed')
  }

  function onTransitionEnd(event: TransitionEvent) {
    if (event.target !== drag.value || event.propertyName !== 'transform')
      return

    if (phase.value === 'opening') {
      clearTransitionTimer()
      phase.value = 'idle'
      return
    }

    if (phase.value === 'closing')
      finishClose()
  }

  let stopListeners: (() => void) | null = null

  function addEvents() {
    if (stopListeners)
      return

    const stops = [
      // Context-menu triggers may stop bubbling touch events during long-press
      // detection, so the sheet observes the gesture before child components.
      useEventListener(containerRef, 'touchstart', onDragStart, { capture: true }),
      useEventListener(containerRef, 'touchmove', onDragging, { capture: true }),
      useEventListener(containerRef, 'touchend', onDragEnd, { capture: true }),
      useEventListener(containerRef, 'touchcancel', onDragEnd, { capture: true }),
      useEventListener(containerRef, 'mousedown', onDragStart),
      useEventListener(containerRef, 'mouseup', onDragEnd),
      useEventListener(document, 'mousemove', onDragging),
      useEventListener(document, 'mouseleave', onDragEnd),
    ]

    stopListeners = () => {
      stops.forEach(fn => fn())
      stopListeners = null
    }
  }

  let initGeneration = 0
  let openFrame: number | null = null

  function removeEvents() {
    initGeneration++
    if (openFrame !== null) {
      cancelAnimationFrame(openFrame)
      openFrame = null
    }
    clearTransitionTimer()
    stopListeners?.()
  }

  async function init() {
    removeEvents()
    const generation = ++initGeneration
    phase.value = 'closed'
    await nextTick()
    if (generation !== initGeneration)
      return

    setInitialY()
    addEvents()
    openFrame = requestAnimationFrame(() => {
      if (generation !== initGeneration)
        return

      openFrame = requestAnimationFrame(() => {
        openFrame = null
        if (generation !== initGeneration)
          return
        phase.value = 'opening'
        initialY.value = detentMode.value ? restingInitialY(collapsedFraction.value) : 0
        transitionTimer = setTimeout(() => {
          if (phase.value === 'opening')
            phase.value = 'idle'
          transitionTimer = null
        }, TRANSITION_FALLBACK_MS)
      })
    })
  }

  watch(expanded, (value) => {
    if (value && detentMode.value && opened.value)
      snapToFraction(expandedFraction.value)
  })

  return {
    close,
    detentMode,
    dragMoved,
    dragStyles,
    init,
    isDragging,
    isExpanded,
    onTransitionEnd,
    opened,
    overflowClasses: computed(() => ({
      'transition-opacity duration-100': !isDragging.value && opened.value,
    })),
    overlayStyles,
    removeEvents,
    wrapClasses: computed<Record<string, boolean>>(() => ({
      'pointer-events-none invisible opacity-0': !opened.value,
    })),
  }
}
