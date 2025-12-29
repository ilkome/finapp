<script setup lang="ts">
import { useElementSize, useEventListener, useWindowSize } from '@vueuse/core'

type Event = TouchEvent | MouseEvent

const props = defineProps<{
  drugClassesCustom?: string
  drugStyle?: Record<string, string>
  isHideOverflow?: boolean
  isShow?: boolean
}>()

const emit = defineEmits<{
  closed: []
}>()

// Settings
const settings = {
  debug: true,
  pixelOffsetToStartClosing: 20,
  pixelsNeedToDrugForClose: 60,
}

// Ref Elements
const drug = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const handlerRef = ref<HTMLElement | null>(null)
const contentInside = ref<HTMLElement | null>(null)

// State
const initialHeight = ref(0)

const initialY = ref(0)
const clientY = ref(0)
const isDragging = ref(true)
const direction = ref<'up' | 'down'>('up')
const isHandler = ref(false)

const disabled = ref(true)
const opened = ref(false)
const isEventsAdded = ref(false)

const { height: drugHeight } = useElementSize(drug)
const { height: windowHeight } = useWindowSize()

/**
 * Next current y
 */
const nextCurrentY = computed(() => clientY.value - initialY.value)

/*
 * Set direction
 */
watch(nextCurrentY, (current, prev) => {
  direction.value = current > prev ? 'down' : 'up'
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
  return Math.round(
    (containerHeight + handlerHeight - nextCurrentY.value)
    / (containerHeight / 100),
  )
})

/**
 * Diff height with debounce
 */
const diffHeightWithDebounce = computed(() => {
  const containerHeight = drug.value?.clientHeight ?? 0
  const handlerHeight = handlerRef.value?.clientHeight ?? 0
  return Math.round(
    (containerHeight + handlerHeight - nextCurrentY.value + debounce.value)
    / (containerHeight / 100),
  )
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
    opacity = Number(
      diffHeightWithDebounce.value >= 100
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
  if (!opened.value) {
    return {
      ...props.drugStyle,
      opacity: 0,
      transform: 'translateY(30px)',
    }
  }

  if (nextCurrentY.value <= debounce.value) {
    return {
      ...props.drugStyle,
      opacity: 1,
      transform: '',
    }
  }

  return {
    ...props.drugStyle,
    transform: `translateY(${nextCurrentY.value - debounce.value}px)`,
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
  if (event.target instanceof Element && event?.target?.closest('.sortHandle'))
    return

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
  diffHeight: computed(() => diffHeight.value),
  diffHeightWithDebounce: computed(() => diffHeightWithDebounce.value),
  direction: computed(() => direction.value),
  nextCurrentY: computed(() => nextCurrentY.value),
  status: 'standby',
})

/**
 * Dragging
 */
function onDragging(event: Event): void {
  if (disabled.value || !isDragging.value)
    return

  const isHasScroll = contentHasScroll(event)

  const bodyHeight = document.querySelector('body')?.clientHeight ?? 0
  const contentInsideHeight = contentInside.value?.clientHeight ?? 0
  const drugHeight = drug.value?.clientHeight ?? 0

  if (
    isDragging.value
    && drug.value
    && drugHeight < contentInsideHeight
    && drugHeight + 10 < bodyHeight
  ) {
    drug.value
      ?.querySelector('.scrollerBlock')
      ?.classList
      .add('pointer-events-none')
    drug.value.style.height = `${initialHeight.value - nextCurrentY.value}px`
  }
  else {
    drug.value
      ?.querySelector('.scrollerBlock')
      ?.classList
      .remove('pointer-events-none')
  }

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
    debug.value.status = nextCurrentY.value >= settings.pixelsNeedToDrugForClose && direction.value === 'down'
      ? 'will close'
      : 'will open'
  }
}

/**
 * Drag end
 */
async function onDragEnd() {
  if (disabled.value || !isDragging.value)
    return

  const bodyHeight = document.querySelector('body')?.clientHeight ?? 0
  const contentInsideHeight = contentInside.value?.clientHeight ?? 0
  const drugHeight = drug.value?.clientHeight ?? 0

  if (direction.value === 'up' && nextCurrentY.value < 0) {
    await nextTick()
    if (
      isDragging.value
      && drug.value
      && drugHeight < contentInsideHeight
      && drugHeight + 10 < bodyHeight
    ) {
      drug.value.style.height = `${bodyHeight - 10}px`
    }
  }

  const isNeedClose
    = nextCurrentY.value >= settings.pixelsNeedToDrugForClose
      && direction.value === 'down'

  if (isNeedClose) {
    close()
  }
  else {
    open()
  }
}

/**
 * Clear
 */
function clear() {
  clientY.value = 0
  isDragging.value = false
}

function setInitialY() {
  initialY.value = -(
    (drug.value?.clientHeight ?? 0) + (handlerRef.value?.clientHeight ?? 0)
  )
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
  scrollerBlocks?.forEach(el => (el.scrollTop = 0))
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
  if (containerRef.value) {
    containerRef.value.addEventListener('touchstart', onDragStart)
    containerRef.value.addEventListener('touchmove', onDragging)
    containerRef.value.addEventListener('touchend', onDragEnd)
    containerRef.value.addEventListener('mousedown', onDragStart)
    containerRef.value.addEventListener('mouseup', onDragEnd)

    document.addEventListener('mousemove', onDragging)
    document.addEventListener('mouseleave', onDragEnd)
  }
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
 * Init modal
 */
async function init() {
  initialHeight.value = drug.value?.clientHeight ?? 0

  setTimeout(async () => {
    setInitialY()
    disabled.value = false
    addEvents()
    setTimeout(() => {
      open()
    }, 10)
  }, 10)
}

function removeEvents() {
  isEventsAdded.value = false
  if (containerRef.value) {
    containerRef.value.removeEventListener('touchstart', onDragStart)
    containerRef.value.removeEventListener('touchmove', onDragging)
    containerRef.value.removeEventListener('touchend', onDragEnd)
    containerRef.value.removeEventListener('mousedown', onDragStart)
    containerRef.value.removeEventListener('mouseup', onDragEnd)

    document.removeEventListener('mousemove', onDragging)
    document.removeEventListener('mouseleave', onDragEnd)
  }
}
/**
 * Run init when mounted or isShow changed
 */
watch(
  () => props.isShow,
  async (value) => {
    if (value)
      await init()

    if (!value)
      removeEvents()

    if (!value && opened.value) {
      close()
    }
  },
  { immediate: true },
)

onBeforeUnmount(removeEvents)
/**
 * Height
 */
const drugClasses = computed(() => [
  {
    'pointer-events-none': isDragging.value && drugStyles.value.transform,
    'rounded-tl-xl rounded-tr-xl': drugHeight.value < windowHeight.value,
    'transition-opacity transition-transform duration-100':
      !isDragging.value && opened.value,
  },
  props.drugClassesCustom,
])

const overflowClasses = computed(() => ({
  'transition-opacity duration-100': !isDragging.value && opened.value,
}))

const wrapClasses = computed(() => ({
  'pointer-events-none': props.isHideOverflow,
  'pointer-events-none invisible opacity-0': !opened.value,
}))
</script>

<template>
  <div
    ref="containerRef"
    :class="wrapClasses"
    class="absolute inset-0 z-50 size-full overflow-hidden select-none"
  >
    <!-- Overlay -->
    <div
      v-if="!isHideOverflow"
      :class="overflowClasses"
      :style="overlayStyles"
      class="absolute inset-0 z-10 size-full bg-[var(--overlay)]"
      @click="close()"
    />

    <!-- Drug -->
    <div
      ref="drug"
      :class="drugClasses"
      :style="drugStyles"
      class="drug pointer-events-auto absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 translate-y-0 overflow-hidden"
      @click.stop=""
    >
      <div ref="handlerRef">
        <slot name="handler" :close="close">
          <BottomSheetHandler />
          <BottomSheetClose @onClick="close" />
        </slot>
      </div>

      <slot :close="close" />
    </div>
  </div>
</template>
