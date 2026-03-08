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
}

function getClientY(event: Event): number {
  return 'touches' in event
    ? Math.round(event.touches[0].clientY)
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

  const dragOffset = computed(() =>
    disabled.value || isHandler.value ? 0 : settings.pixelOffsetToStartClosing,
  )

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
      return {
        ...dragStyle.value,
        opacity: 0,
        transform: 'translateY(30px)',
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

  function contentHasScroll(event: Event): boolean {
    const swiperSlide = drag.value?.querySelector('.swiper-slide-active')
    const scrollerInSlide = swiperSlide?.querySelector('.scrollerBlock')
    if (scrollerInSlide)
      return scrollerInSlide.scrollTop > 0 && event.type.includes('touch')

    const scroller = drag.value?.querySelector('.scrollerBlock')
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

      clientY.value = getClientY(event)
      initialY.value = clientY.value + initialY.value
      isDragging.value = true
    }
  }

  function onDragging(event: Event): void {
    if (disabled.value || !isDragging.value)
      return

    if (contentHasScroll(event) && !isHandler.value) {
      isDragging.value = false
      initialY.value = 0
      clientY.value = 0
      return
    }

    if (isDragging.value)
      clientY.value = getClientY(event)
  }

  function onDragEnd() {
    if (disabled.value || !isDragging.value)
      return

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
    initialY.value = 0
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

  // Event listener management
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
      setTimeout(() => open(), INIT_DELAY_MS)
    }, INIT_DELAY_MS)
  }

  return {
    close,
    dragStyles,
    init,
    isDragging,
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
