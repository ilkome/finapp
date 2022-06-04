<script lang="ts">
import { useEventListener } from '@vueuse/core'

export default defineComponent({
  props: {
    keepAlive: { type: Boolean, default: false },
    show: { type: Boolean, default: false },
    maxHeight: { type: Number, default: null },
    height: { type: Number, default: null },
    insideClass: { type: String, default: null },
    isScrollerBlock: { type: Boolean, default: true },
  },

  setup(props, { emit }) {
    // settings
    const settings = {
      moveToCloseOffset: 60,
      debounceOffset: 20,
    }

    // elements
    const drug = ref<Element | null>(null)
    const drugHeader = ref<Element | null>(null)
    const container = ref<HTMLElement | null>(null)
    const handler = ref<HTMLElement | null>(null)

    // state
    const initialY = ref(0)
    const clientY = ref(0)
    const isDragging = ref(true)
    const direction = ref('up')
    const isHandler = ref(false)

    const disabled = ref(true)
    const opened = ref(false)
    const isEventsInited = ref(false)

    const debug = ref({
      status: 'standby',
      direction: computed(() => direction.value),
      diffHeight: computed(() => diffHeight.value),
      diffHeightWithDebounce: computed(() => diffHeightWithDebounce.value),
      nextCurrentY: computed(() => nextCurrentY.value),
    })

    const maxHeightScroll = computed(() => {
      if (!props.maxHeight || !drugHeader.value)
        return false

      return `${props.maxHeight - drugHeader.value?.clientHeight - 40}px`
    })

    const heightScroll = computed(() => {
      if (!props.height || !drugHeader.value)
        return false

      return `${props.height - drugHeader.value?.clientHeight - 40}px`
    })

    /**
     * Next current y
     */
    const nextCurrentY = computed(() => clientY.value - initialY.value)

    /**
     * Debounce drug
     */
    const debounce = computed(() => disabled.value || isHandler.value ? 0 : settings.debounceOffset)

    /**
     * Drug styles
     */
    const drugStyles = computed(() => {
      if (nextCurrentY.value <= debounce.value) {
        return {
          opacity: 1,
        }
      }

      return {
        transform: `translateX(-50%) translateY(${nextCurrentY.value - debounce.value}px)`,
        ...overlayStyles.value,
      }
    })

    /**
     * Diff height
     */
    const diffHeight = computed(() => {
      const containerHeight = drug.value?.clientHeight
      const handlerHeight = handler.value?.clientHeight
      return Math.round((containerHeight + handlerHeight - nextCurrentY.value) / (containerHeight / 100))
    })

    /**
     * Diff height with debounce
     */
    const diffHeightWithDebounce = computed(() => {
      const containerHeight = drug.value?.clientHeight
      const handlerHeight = handler.value?.clientHeight
      return Math.round((containerHeight + handlerHeight - nextCurrentY.value + debounce.value) / (containerHeight / 100))
    })

    /**
     * Overlay Opacity
     */
    const overlayStyles = computed(() => {
      let opacity = 1

      if (nextCurrentY.value <= debounce.value)
        return

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
     * Get client Y
     */
    function getClientY(event): number {
      return event.type.includes('touch')
        ? Math.round(event.touches[0].clientY)
        : event.clientY
    }

    /**
     * Content has scroll
     */
    function contentHasScroll(event): boolean {
      // Handle scroll inside slider
      const swiperSlideActive = drug.value?.querySelector('.swiper-slide-active')
      if (swiperSlideActive) {
        const scrollerBlock = swiperSlideActive.querySelector('.scrollerBlock')
        if (scrollerBlock)
          return scrollerBlock.scrollTop > 0 && event.type.includes('touch')
      }

      const scrollerBlock = drug.value?.querySelector('.scrollerBlock')
      if (!swiperSlideActive && scrollerBlock)
        return scrollerBlock.scrollTop > 0 && event.type.includes('touch')
    }

    /**
     * Drag start
     */
    function onDragStart(event): void {
      if (disabled.value)
        return

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

    /**
     * Dragging
     */
    function onDragging(event): void {
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

      nextCurrentY.value >= settings.moveToCloseOffset && direction.value === 'down'
        ? debug.value.status = 'will close'
        : debug.value.status = 'will open'
    }

    /**
     * Drag end
     */
    function onDragEnd(): void {
      if (disabled.value || !isDragging.value)
        return

      nextCurrentY.value >= settings.moveToCloseOffset && direction.value === 'down'
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

    /**
     * Close modal
     */
    function close() {
      clear()
      initialY.value = -(drug.value.clientHeight + handler.value.clientHeight)
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
     * Scroll up all scroller blocks
     */
    function scrollUpAllScrollers() {
      const scrollerBlocks = drug.value?.querySelectorAll('.scrollerBlock')
      if (scrollerBlocks) {
        scrollerBlocks.forEach((el) => {
          el.scrollTop = 0
        })
      }
    }

    /**
     * On close modal
     */
    function onClose() {
      scrollUpAllScrollers()
      drug.value.removeEventListener('transitionend', onClose)
      opened.value = false
      emit('closed')
    }

    /**
     * Add events listeners
     */
    function addEvents() {
      isEventsInited.value = true

      // Touch
      useEventListener(container, 'touchstart', onDragStart, { passive: true })
      useEventListener(container, 'touchmove', onDragging, { passive: true })
      useEventListener(container, 'touchend', onDragEnd, { passive: true })

      // Mouse
      useEventListener(container, 'mousedown', onDragStart, { passive: true })
      useEventListener(document, 'mousemove', onDragging, { passive: true })

      // Mouse: Finish drag event only when mouse released
      useEventListener(container, 'mouseup', onDragEnd, { passive: true })
      useEventListener(document, 'mouseleave', onDragEnd, { passive: true })
    }

    /**
     * Init modal
     */
    async function init() {
      await nextTick()
      initialY.value = -(drug.value.clientHeight + handler.value.clientHeight)
      disabled.value = false

      if (!isEventsInited.value)
        addEvents()

      await nextTick()
      open()
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
      }
      else {
        disabled.value = false
      }
    })

    /**
     * Watch for nextCurrent Y
     */
    watch(() => nextCurrentY.value, (current, prev) => {
      current > prev
        ? direction.value = 'down'
        : direction.value = 'up'
    })

    /**
     * Run init when mounted or show changed
     */
    watch(() => props.show, async () => {
      if (!props.keepAlive || (props.keepAlive && props.show))
        await init()

      if (props.keepAlive && !props.show && opened.value)
        close()
    }, { immediate: true })

    return {
      close,
      container,
      debug,
      drug,
      drugHeader,
      drugStyles,
      handler,
      isDragging,
      maxHeightScroll,
      heightScroll,
      open,
      opened,
      overlayStyles,
    }
  },
})
</script>

<template lang="pug">
.modalContainer(
  ref="container"
  :class="{ _hidden: !opened }"
)
  .overflow(
    @click="close()"
    :class="{ _anim: !isDragging && opened, _hidden: !opened }"
    :style="overlayStyles"
  )

  .drug(
    ref="drug"
    :class="{ _anim: !isDragging && opened, _drug: isDragging && drugStyles.transform }"
    :style="drugStyles"
  )
    .drug__header(ref="drugHeader")
      slot(name="header" :close="close")

    .drug__inside(
      :class="[insideClass, { _scroll: !!maxHeightScroll, scrollerBlock: (!!maxHeightScroll && isScrollerBlock) }]"
      :style="{ maxHeight: maxHeight && maxHeightScroll, height: height && heightScroll }"
    )
      .handler(ref="handler")
        slot(name="handler" :close="close")

      .scroll
        slot(:close="close")
          .info
            .info__item Status: {{ debug.status }}
            .info__item Direction: {{ debug.direction }}
            .info__item DiffHeight: {{ debug.diffHeight }}
            .info__item DiffHeightWithDebounce: {{ debug.diffHeightWithDebounce }}
            .info__item NextCurrentY: {{ debug.nextCurrentY }}
            .info__item drugStyles: {{ drugStyles.transform }}
</template>

<style lang="stylus" scoped>
.info
  padding 20px

  &__item
    padding-bottom 10px

    &:last-child
      padding-bottom 0

.modalContainer
  overflow hidden
  z-index 1000
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  user-select none

  &._hidden
    visibility hidden
    opacity 0
    pointer-events none

.overflow
  overflow hidden
  z-index 10
  position absolute
  left 0
  bottom 0
  width 100%
  height 100%
  background var(--c-bg-14)
  // backdrop-filter blur(6px)

  &._anim
    transition opacity 250ms ease

  &._hidden
    opacity 0
    pointer-events none

.drug
  z-index 20
  position absolute
  left 50%
  bottom 0
  width 100%
  height auto
  max-width 480px
  transform translateX(-50%) translateY(0)

  +media(600px)
    top 50%
    bottom inherit
    transform translateX(-50%) translateY(-50%)

  &._anim
    transition transform 150ms ease-out, opacity 150ms ease-out

  &._drug
    user-select none
    pointer-events none

  &__inside
    &._scroll
      overflow hidden
      overflowScrollY()

.scroll
  overflow hidden
  display grid
  height 100%
  user-select none

.handler
  user-select none
</style>
