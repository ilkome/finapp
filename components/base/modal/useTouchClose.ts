export default function useOnTouch() {
  let isDragging = true
  let isDrugByHandler = false
  let initialY = 0
  let currentY = 0

  let config = {
    dragOffset: 16,
    waitForScrollClassName: 'waitForScroll',
    waitForScrollSliderClassName: 'waitForScrollSlider',
    doNotTouchClassName: 'doNotCloseModal',
    animClassName: '_anim',
  }

  let container: (null | any) = null
  let overflow: (null | any) = null
  let wrap: (null | any) = null
  let content: (null | any) = null
  let onClose: (null | any) = null
  let handler: (null | any) = null
  let isInit: boolean = false

  /**
   * Init
   * @param props
   */
  function initTouchModal(props: any): void {
    container = props.container
    overflow = props.overflow
    wrap = props.wrap
    content = props.content
    onClose = props.onClose
    handler = props.handler

    if (props.config) {
      config = {
        ...config,
        ...props.config.value,
      }
    }

    if (!isInit) {
      if (!container.value)
        return
      isInit = true
      container.value.addEventListener('touchstart', onDragStart, { passive: true })
      container.value.addEventListener('touchmove', onDragging, { passive: true })
      container.value.addEventListener('touchend', onDragEnd, { passive: true })
      container.value.addEventListener('mouseup', onDragEnd, { passive: true })
    }
  }

  /**
   * Translate
   */
  function setTranslate(): void {
    if (!wrap.value)
      return
    const offset = isDrugByHandler ? 0 : config.dragOffset

    if (currentY === 0) {
      wrap.value.style.transform = ''
      wrap.value.style.opacity = ''
      overflow.value.style.opacity = ''
    }
    else if (currentY >= offset) {
      const containerHeight = container.value.clientHeight
      const diff = (containerHeight - currentY) / (containerHeight / 100)
      const diffTrunc = Math.trunc(diff)
      const opacity = diffTrunc === 100 ? 1 : diffTrunc >= 10 ? `0.${diffTrunc}` : `0.0${diffTrunc}`

      wrap.value.style.transform = `translate3d(0, ${currentY + offset}px, 0)`

      wrap.value.style.opacity = +opacity * 1.6
      overflow.value.style.opacity = opacity
    }
  }

  /**
   * Drag start handler
   * @param event
   */
  function onDragStart(event: any): void {
    isDragging = false
    wrap.value.classList.remove(config.animClassName)

    // Always use touch with handler
    isDrugByHandler = handler.value && event.target.classList.contains(handler.value.classes)
    if (isDrugByHandler) {
      isDrugByHandler = true
      isDragging = true
    }
    // Check if should drag modal
    else {
      // Do not close modal inside this div
      if (event.target.closest(`.${config.doNotTouchClassName}`))
        return

      // Stop drag when content has scroll
      // wait until content scroll up to top
      if (content.value) {
        if (content.value.scrollTop > 0)
          return

        // wait until content scroll up inside Swiper
        const waitForScrollSlider = content.value.querySelector(`.swiper-slide-active .${config.waitForScrollClassName}`)
        if (waitForScrollSlider && waitForScrollSlider.scrollTop > 0)
          return

        const waitForScrollSlider2 = content.value.querySelector(`.swiper-slide-active .${config.waitForScrollSliderClassName}`)
        if (waitForScrollSlider2 && waitForScrollSlider2.scrollTop > 0)
          return

        // wait until content scroll up inside
        const waitForScroll = content.value.querySelector(`.${config.waitForScrollClassName}`)
        if (waitForScroll && waitForScroll.scrollTop > 0)
          return
      }
    }

    // Drag inside wrap
    if (event.target.closest(`.${wrap.value.classes}`))
      isDragging = true

    if (isDragging) {
      event.type === 'touchstart'
        ? initialY = event.touches[0].clientY
        : initialY = event.clientY
    }
  }

  /**
   * Dragging handler
   * @param event
   */
  function onDragging(event: any): void {
    if (isDragging) {
      event.type === 'touchmove'
        ? currentY = event.touches[0].clientY - initialY
        : currentY = event.clientY - initialY

      setTranslate()
    }
  }

  /**
   * Drag end handler
   */
  function onDragEnd(): void {
    if (currentY >= 80) {
      closeModal()
    }
    else {
      currentY = 0
      setTranslate()
      if (isDragging)
        wrap.value.classList.add(config.animClassName)
    }
  }

  /**
   * Transition end handler
   */
  function onTransitionEnd(): void {
    wrap.value.removeEventListener('transitionend', onTransitionEnd)
    currentY = 0
    wrap.value.style.transform = ''
    wrap.value.style.opacity = ''
    overflow.value.style.opacity = ''
    if (onClose)
      onClose()
  }

  /**
   * Close modal
   */
  function closeModal(): void {
    isDragging = false
    isDrugByHandler = false

    if (!container.value) {
      currentY = 0
      wrap.value.style.transform = ''
      wrap.value.style.opacity = ''
      overflow.value.style.opacity = ''
      if (onClose)
        onClose()
      return
    }

    currentY = container.value.clientHeight
    wrap.value.classList.add(config.animClassName)
    wrap.value.style.opacity = 0
    overflow.value.style.opacity = 0
    setTranslate()

    wrap.value.addEventListener('transitionend', onTransitionEnd, { passive: true })
    setTimeout(() => {
      currentY = 0
      wrap.value.style.transform = ''
      wrap.value.style.opacity = ''
      overflow.value.style.opacity = ''
    }, 2000)
  }

  /**
   * onUnmounted
   */
  onUnmounted(() => {
    if (!container || !container.value)
      return
    container.value.removeEventListener('touchstart', onDragStart)
    container.value.removeEventListener('touchmove', onDragging)
    container.value.removeEventListener('touchend', onDragEnd)
    container.value.removeEventListener('mouseup', onDragEnd)
  })

  return {
    initTouchModal,
    closeModal,
  }
}
