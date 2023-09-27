<script setup lang="ts">
import { useElementSize, useEventListener, useWindowSize } from '@vueuse/core'

type Event = TouchEvent | MouseEvent

const props = defineProps<{
  isShow?: boolean
}>()

const emit = defineEmits<{
  (e: 'closed'): void
}>()

// Settings
const settings = {
  pixelsNeedToDrugForClose: 60,
  pixelOffsetToStartClosing: 20,
  debug: false,
}

// Ref Elements
const drug = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const handlerRef = ref<HTMLElement | null>(null)

// State
const initialY = ref(0)
const clientY = ref(0)
const isDragging = ref(true)
const direction = ref<'up' | 'down'>('up')
const isHandler = ref(false)

const disabled = ref(true)
const opened = ref(false)
const isEventsAdded = ref(false)

/**
 * Next current y
 */
const nextCurrentY = computed(() => clientY.value - initialY.value)

/*
 * Set direction
 */
watch(nextCurrentY, (current, prev) => {
  current > prev
    ? direction.value = 'down'
    : direction.value = 'up'
})

/**
 * Debounce drug
 */
const debounce = computed(() =>
  disabled.value || isHandler.value ? 0 : settings.pixelOffsetToStartClosing,
)

/**
 * Diff height
 */
const diffHeight = computed(() => {
  const containerHeight = drug.value?.clientHeight ?? 0
  const handlerHeight = handlerRef.value?.clientHeight ?? 0
  return Math.round((containerHeight + handlerHeight - nextCurrentY.value) / (containerHeight / 100))
})

/**
 * Diff height with debounce
 */
const diffHeightWithDebounce = computed(() => {
  const containerHeight = drug.value?.clientHeight ?? 0
  const handlerHeight = handlerRef.value?.clientHeight ?? 0
  return Math.round((containerHeight + handlerHeight - nextCurrentY.value + debounce.value) / (containerHeight / 100))
})

/**
 * Overlay Opacity
 */
const overlayStyles = computed(() => {
  if (nextCurrentY.value <= debounce.value)
    return

  let opacity = 1
  if (diffHeight.value < 0 || diffHeight.value > 100) {
    opacity = nextCurrentY.value <= 100 ? 1 : 0
  }
  else {
    opacity = Number(diffHeightWithDebounce.value >= 100
      ? 1
      : diffHeightWithDebounce.value >= 10
        ? `0.${diffHeightWithDebounce.value}`
        : `0.0${diffHeightWithDebounce.value}`,
    )
  }
  return {
    opacity,
  }
})

/**
 * Drug styles
 */
const drugStyles = computed(() => {
  if (nextCurrentY.value <= debounce.value) {
    return {
      opacity: 1,
      transform: '',
    }
  }

  return {
    transform: `translateX(-50%) translateY(${nextCurrentY.value - debounce.value}px)`,
    ...overlayStyles.value,
  }
})

/**
 * Get client Y
 */
function getClientY(event: Event): number {
  return 'touches' in event
    ? Math.round(event.touches[0].clientY)
    : event.clientY
}

/**
 * Content has scroll
 */
function contentHasScroll(event: Event) {
  // Handle scroll inside slider
  const swiperSlideActive = drug.value?.querySelector('.swiper-slide-active')
  if (swiperSlideActive) {
    const scrollerBlock = swiperSlideActive.querySelector('.scrollerBlock')
    if (scrollerBlock)
      return scrollerBlock.scrollTop > 0 && event.type.includes('touch')
  }

  // const scrollerBlock = drug.value?.querySelector('.scrollerBlock')
  // if (!swiperSlideActive && drug.value)
  //   return drug.value.scrollTop > 0 && event.type.includes('touch')

  const scrollerBlock = drug.value?.querySelector('.scrollerBlock')
  if (!swiperSlideActive && scrollerBlock)
    return scrollerBlock.scrollTop > 0 && event.type.includes('touch')
}

/**
 * Drag start
 */
function onDragStart(event: Event): void {
  if (disabled.value)
    return

  if (event.target instanceof Element) {
    isHandler.value = event.target.classList.contains('handler')
    const isTarget = event.target.closest('.drug')
    const isHasScroll = contentHasScroll(event)

    if ((!isTarget || isHasScroll) && !isHandler.value) {
      isDragging.value = false
      return
    }

    clientY.value = getClientY(event)
    initialY.value = clientY.value + initialY.value
    isDragging.value = true
  }
}

const debug = ref({
  status: 'standby',
  direction: computed(() => direction.value),
  diffHeight: computed(() => diffHeight.value),
  diffHeightWithDebounce: computed(() => diffHeightWithDebounce.value),
  nextCurrentY: computed(() => nextCurrentY.value),
})

/**
 * Dragging
 */
function onDragging(event: Event): void {
  if (disabled.value)
    return

  const isHasScroll = contentHasScroll(event)

  if (isHasScroll && !isHandler.value) {
    isDragging.value = false
    initialY.value = 0
    clientY.value = 0
    return
  }

  // drug on pc only by handler drug on mobile everywhere
  // if (isDragging.value && ((!isHandler.value && event.type.includes('touch') || isHandler.value)))
  //   clientY.value = getClientY(event)

  if (isDragging.value)
    clientY.value = getClientY(event)

  if (settings.debug) {
    nextCurrentY.value >= settings.pixelsNeedToDrugForClose && direction.value === 'down'
      ? debug.value.status = 'will close'
      : debug.value.status = 'will open'
  }
}

/**
 * Drag end
 */
function onDragEnd(): void {
  if (disabled.value || !isDragging.value)
    return

  const isNeedClose = (nextCurrentY.value >= settings.pixelsNeedToDrugForClose) && direction.value === 'down'
  isNeedClose
    ? close()
    : open()
}

/**
 * Clear
 */
function clear() {
  clientY.value = 0
  isDragging.value = false
}

function setInitialY() {
  initialY.value = -((drug.value?.clientHeight ?? 0) + (handlerRef.value?.clientHeight ?? 0))
}

/**
 * Close modal
 */
function close() {
  clear()
  setInitialY()
}

/**
 * Open modal
 */
function open() {
  clear()
  opened.value = true
  initialY.value = 0
}

/**
 * On close modal
 */
function onClose() {
  // Scroll up all scroller blocks
  const scrollerBlocks = drug.value?.querySelectorAll('.scrollerBlock')
  scrollerBlocks?.forEach(el => el.scrollTop = 0)
  drug.value?.removeEventListener('transitionend', onClose)
  opened.value = false
  emit('closed')
}

/**
 * Add events listeners
 */
function addEvents() {
  if (isEventsAdded.value)
    return

  isEventsAdded.value = true

  // Touch
  useEventListener(containerRef, 'touchstart', onDragStart, { passive: true })
  useEventListener(containerRef, 'touchmove', onDragging, { passive: true })
  useEventListener(containerRef, 'touchend', onDragEnd, { passive: true })

  // Mouse
  useEventListener(containerRef, 'mousedown', onDragStart, { passive: true })
  useEventListener(document, 'mousemove', onDragging, { passive: true })

  // Mouse: Finish drag event only when mouse released
  useEventListener(containerRef, 'mouseup', onDragEnd, { passive: true })
  useEventListener(document, 'mouseleave', onDragEnd, { passive: true })
}

/**
 * Init modal
 */
async function init() {
  setTimeout(async () => {
    setInitialY()
    disabled.value = false
    addEvents()
    setTimeout(() => {
      open()
    }, 100)
  }, 10)
}

/**
 * Watch for diff height
 */
watch(diffHeight, () => {
  if (isDragging.value)
    return

  if (diffHeight.value === 0) {
    disabled.value = true
    useEventListener(drug, 'transitionend', onClose, { passive: true })
    return
  }

  disabled.value = false
})

/**
 * Run init when mounted or isShow changed
 */
watch(() => props.isShow, async () => {
  if (props.isShow)
    await init()

  if (!props.isShow && opened.value)
    close()
}, { immediate: true })

/**
 * Height
 */
const { height: drugHeight } = useElementSize(drug)
const { height: windowHeight } = useWindowSize()

const drugClasses = computed(() => ({
  'rounded-tl-xl rounded-tr-xl': drugHeight.value < windowHeight.value,
  'transition-opacity transition-transform': !isDragging.value && opened.value,
  'pointer-events-none': isDragging.value && drugStyles.value.transform,
}))

const overflowClasses = computed(() => ({
  'transition-opacity': !isDragging.value && opened.value,
  'pointer-events-none opacity-0': !opened.value,
}))

const wrapClasses = computed(() => ({
  'pointer-events-none invisible opacity-0': !opened.value,
}))
</script>

<template lang="pug">
.z-50.select-none.overflow-hidden.absolute.inset-0.w-full.h-full(
  ref="containerRef"
  :class="wrapClasses"
)
  //- Overlay
  div(
    :class="overflowClasses"
    :style="overlayStyles"
    class=`
      absolute inset-0 w-full h-full
      bg-foreground-main/70
    `
    @click="close()"
  )

  //- Drug
  .drug(
    ref="drug"
    :class="drugClasses"
    :style="drugStyles"
    class=`
      overflow-hidden
      z-10 absolute left-1/2 bottom-0 w-full max-w-5xl h-auto
      -translate-x-1/2 translate-y-0
      bg-foreground-second
    `
    @click.stop=""
  )

    div(ref="handlerRef")
      slot(name="handler" :close="close")

    slot(:close="close")
      .overflow-hidden.grid.h-full.select-none
        .flex.flex-col.gap-2
          .p-2 Status: {{ debug.status }}
          .p-2 Direction: {{ debug.direction }}
          .p-2 DiffHeight: {{ diffHeight }}
          .p-2 DiffHeightWithDebounce: {{ debug.diffHeightWithDebounce }}
          .p-2 NextCurrentY: {{ debug.nextCurrentY }}
          .p-2 drugStyles: {{ drugStyles }}
          .p-2 overlayStyles: {{ overlayStyles }}
</template>
