import type { Ref } from 'vue'

type Event = TouchEvent | MouseEvent

const PERCENT_BASE = 100
const INIT_DELAY_MS = 10

type UseBottomSheetDragParams = {
  containerRef: Ref<HTMLElement | null>
  drag: Ref<HTMLElement | null>
  dragStyle: Ref<Record<string, string> | undefined>
  emit: (event: 'closed') => void
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

// Finger speed (px/ms) past which a flick overrides position-based snapping.
const FLICK_VELOCITY = 0.6
// Distance from the resting collapsed offset within which the sheet reads as
// fully expanded, so inner scrolling takes over instead of sheet drag.
const EXPANDED_EPS = 1

function getClientY(event: Event): number {
  return 'touches' in event
    ? Math.round(event.touches[0]!.clientY)
    : event.clientY
}

function calcVisiblePercent(
  containerHeight: number,
  handlerHeight: number,
  dragDistance: number,
): number {
  if (containerHeight === 0)
    return 0
  return Math.round(
    (containerHeight + handlerHeight - dragDistance)
    / (containerHeight / PERCENT_BASE),
  )
}

function calcOverlayOpacity(visiblePercent: number): number {
  return Math.min(1, Math.max(0, visiblePercent / PERCENT_BASE))
}

function shouldClose(dragDistance: number, threshold: number, direction: 'down' | 'up'): boolean {
  return dragDistance >= threshold && direction === 'down'
}

export function useBottomSheetDrag({
  containerRef,
  drag,
  dragStyle,
  emit,
  handlerRef,
  settings,
  snapPoints,
  windowHeight,
}: UseBottomSheetDragParams) {
  const initialY = ref(0)
  const clientY = ref(0)
  // Must start as `true` so the visiblePercent watcher skips during init().
  // Without this, setInitialY() → visiblePercent=0 → watcher sets disabled=true,
  // undoing the disabled=false that init() sets right after.
  const isDragging = ref(true)
  const direction = ref<'down' | 'up'>('up')
  const isHandler = ref(false)
  const disabled = ref(true)
  const opened = ref(false)

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

  const detentMode = computed(() => {
    const points = snapPoints?.value
    return (
      Array.isArray(points)
      && points.length >= 2
      && points.every(f => typeof f === 'number' && f > 0)
    )
  })

  // Snap points accept viewport fractions (<= 1) or absolute pixels (> 1),
  // resolved to fractions of the current viewport, clamped and sorted ascending.
  const detentFractions = computed(() => {
    if (!detentMode.value)
      return []
    const wh = windowHeight.value || 1
    return snapPoints!.value!
      .map(v => (v > 1 ? v / wh : v))
      .map(f => Math.min(1, Math.max(0.05, f)))
      .sort((a, b) => a - b)
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
    return -((expandedFraction.value - f) * windowHeight.value)
  }

  const isExpanded = computed(() =>
    detentMode.value && Math.abs(dragDistance.value) <= EXPANDED_EPS,
  )

  const dragOffset = computed(() => {
    if (detentMode.value)
      return 0
    return disabled.value || isHandler.value ? 0 : settings.pixelOffsetToStartClosing
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
      // Detent sheets rest partly down, so start fully below the fold and slide
      // up on open; the plain 30px offset would make them drop in from the top.
      const closedTransform = detentMode.value
        ? `translateY(${expandedFraction.value * windowHeight.value}px)`
        : 'translateY(30px)'
      return {
        ...dragStyle.value,
        opacity: 0,
        transform: closedTransform,
      }
    }

    // Detent mode follows the finger 1:1 but never lifts above the expanded
    // detent (translateY < 0); an over-drag up hands off to inner scroll.
    if (detentMode.value) {
      const clamped = Math.max(0, dragDistance.value)
      return {
        ...dragStyle.value,
        opacity: 1,
        transform: clamped === 0 ? '' : `translateY(${clamped}px)`,
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
    const nodes = root?.querySelectorAll<HTMLElement>('.scrollerBlock')
    for (const el of nodes ?? []) {
      if (el.offsetParent !== null)
        return el
    }
    return null
  }

  function contentHasScroll(event: Event): boolean {
    // Below the expanded detent the sheet owns the drag (up-drag expands it),
    // so never hand off to inner scroll until fully expanded.
    if (detentMode.value && !isExpanded.value)
      return false

    // A swiper keeps `swiper-slide-active` on its active slide even when the
    // whole swiper is display:none (e.g. hidden behind search results). Skip a
    // hidden slide so we test the scroller that's actually on screen, not the
    // stale one whose scrollTop is pinned to 0.
    const active = drag.value?.querySelector('.swiper-slide-active')
    const swiperSlide = active instanceof HTMLElement && active.offsetParent !== null ? active : null
    const scrollerInSlide = swiperSlide?.querySelector('.scrollerBlock')
    if (scrollerInSlide)
      return scrollerInSlide.scrollTop > 0 && event.type.includes('touch')

    const scroller = firstVisibleScroller(drag.value)
    if (!swiperSlide && scroller)
      return scroller.scrollTop > 0 && event.type.includes('touch')

    return false
  }

  function onDragStart(event: Event): void {
    if (event.target instanceof Element && event.target.closest('.sortHandle'))
      return

    if (disabled.value)
      return

    if (event.target instanceof Element) {
      isHandler.value = event.target.classList.contains('handler')
      const isTarget = event.target.closest('.drag')
      const hasScroll = contentHasScroll(event)

      if ((!isTarget || hasScroll) && !isHandler.value) {
        isDragging.value = false
        return
      }

      if (detentMode.value) {
        dragStartOffset.value = -initialY.value
        startedExpanded.value = dragStartOffset.value <= EXPANDED_EPS
      }

      clientY.value = getClientY(event)
      initialY.value = clientY.value + initialY.value
      isDragging.value = true

      if (detentMode.value) {
        lastMoveY.value = clientY.value
        lastMoveT.value = performance.now()
        velocity.value = 0
      }
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

  function onDragging(event: Event): void {
    if (disabled.value || !isDragging.value)
      return

    if (detentMode.value) {
      const y = getClientY(event)
      // From the expanded detent the inner list owns vertical scrolling: hand off
      // as soon as the finger moves up or the list is already scrolled. Only a
      // downward drag at the top edge stays with the sheet (to dismiss).
      if (startedExpanded.value && !isHandler.value
        && (contentHasScroll(event) || y < clientY.value)) {
        isDragging.value = false
        initialY.value = 0
        clientY.value = 0
        return
      }
      clientY.value = y
      sampleVelocity(y)
      return
    }

    if (contentHasScroll(event) && !isHandler.value) {
      isDragging.value = false
      initialY.value = 0
      clientY.value = 0
      return
    }

    if (isDragging.value)
      clientY.value = getClientY(event)
  }

  function snapToFraction(f: number) {
    resetDrag()
    opened.value = true
    initialY.value = restingInitialY(f)
  }

  function snapOnDragEnd() {
    const current = Math.max(0, dragDistance.value)
    const delta = current - dragStartOffset.value // + moved down, - moved up
    const flickDown = velocity.value > FLICK_VELOCITY
    const flickUp = velocity.value < -FLICK_VELOCITY
    const threshold = settings.pixelsNeedToDragForClose

    // Downward always dismisses - no intermediate collapse on the way out.
    if (flickDown || delta > threshold) {
      close()
      return
    }

    // Upward from a collapsed detent expands to full.
    if (flickUp || delta < -threshold) {
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
    if (disabled.value || !isDragging.value)
      return

    if (detentMode.value) {
      snapOnDragEnd()
      return
    }

    if (shouldClose(dragDistance.value, settings.pixelsNeedToDragForClose, direction.value))
      close()
    else
      open()
  }

  function resetDrag() {
    clientY.value = 0
    isDragging.value = false
  }

  function setInitialY() {
    initialY.value = -(
      (drag.value?.clientHeight ?? 0) + (handlerRef.value?.clientHeight ?? 0)
    )
  }

  function close() {
    resetDrag()
    setInitialY()
  }

  function open() {
    resetDrag()
    opened.value = true
    initialY.value = detentMode.value ? restingInitialY(collapsedFraction.value) : 0
  }

  let stopTransitionListener: (() => void) | null = null

  function onTransitionEnd() {
    const scrollerBlocks = drag.value?.querySelectorAll('.scrollerBlock')
    scrollerBlocks?.forEach(el => (el.scrollTop = 0))
    stopTransitionListener?.()
    stopTransitionListener = null
    opened.value = false
    emit('closed')
  }

  let stopListeners: (() => void) | null = null

  function addEvents() {
    if (stopListeners)
      return

    const stops = [
      useEventListener(containerRef, 'touchstart', onDragStart),
      useEventListener(containerRef, 'touchmove', onDragging),
      useEventListener(containerRef, 'touchend', onDragEnd),
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

  function removeEvents() {
    stopListeners?.()
  }

  watch(visiblePercent, () => {
    if (isDragging.value)
      return

    if (visiblePercent.value === 0) {
      disabled.value = true
      stopTransitionListener?.()
      stopTransitionListener = useEventListener(drag, 'transitionend', onTransitionEnd, { passive: true })
      return
    }

    disabled.value = false
  })

  function init() {
    setTimeout(() => {
      setInitialY()
      disabled.value = false
      addEvents()
      setTimeout(open, INIT_DELAY_MS)
    }, INIT_DELAY_MS)
  }

  return {
    close,
    detentMode,
    dragStyles,
    init,
    isDragging,
    isExpanded,
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
