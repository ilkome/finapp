import { ref, onMounted, onUnmounted } from '@nuxtjs/composition-api'

export default function useOnTouch ({ container, overflow, dragger, content, onClose, noDragClasss }) {
  const isDragging = ref(false)
  const initialY = ref(0)
  const currentY = ref(0)
  const currentX = ref(0)

  // setTranslate
  const setTranslate = () => {
    if (!dragger.value) { return }

    if (currentY.value === 0) {
      dragger.value.style.transform = ''
      if (overflow.value) {
        overflow.value.style.opacity = ''
      }
    }
    else if (currentY.value > 0) {
      const containerHeight = container.value.clientHeight
      const diff = (containerHeight - currentY.value) / (containerHeight / 100)
      const diffTrunc = Math.trunc(diff)

      if (dragger.value) {
        dragger.value.style.transform = `translate3d(0, ${currentY.value}px, 0)`
      }
      if (overflow.value) {
        overflow.value.style.opacity = diffTrunc === 100 ? 1 : `0.${diffTrunc}`
      }
    }
    // else if (currentY.value < 0) {
    //   const swiperWrapper = dragger.value.querySelector('.swiper-wrapper')
    //   dragger.value.style.maxHeight = '700px'
    //   swiperWrapper.style.height = '700px'
    // }
  }

  // onDragStart
  const onDragStart = (event) => {
    const isDrugByHandler = event.target.classList.contains('trnForm__handler')

    // wait
    if (!isDrugByHandler) {
      // stop trnFormModal drag when content has scroll
      // wait until content scroll up to top
      if (content.value && content.value.scrollTop > 0) { return }

      if (event.target.closest('.doNotCloseModal')) {
        isDragging.value = false
        return
      }

      const waitForScrollSlider = content.value.querySelector('.swiper-slide-active .waitForScroll')
      if (waitForScrollSlider && waitForScrollSlider.scrollTop > 0) { return }

      const waitForScroll = content.value.querySelector('.waitForScroll')
      if (waitForScroll && waitForScroll.scrollTop > 0) { return }
    }

    if (dragger.value) {
      dragger.value.classList.remove('_anim')

      event.type === 'touchstart'
        ? initialY.value = event.touches[0].clientY
        : initialY.value = event.clientY

      if (event.target.closest(`.${dragger.value.className}`)) { isDragging.value = true }
      if (noDragClasss && event.target.closest(noDragClasss)) { isDragging.value = false }
    }
  }

  // onDragging
  const onDragging = (event) => {
    if (isDragging.value) {
      event.type === 'touchmove'
        ? currentY.value = event.touches[0].clientY - initialY.value
        : currentY.value = event.clientY - initialY.value

      if ((Math.abs(currentY.value) < Math.abs(currentX.value))) { return }

      setTranslate()
    }
  }

  // onDragEnd
  const onDragEnd = () => {
    if (currentY.value >= 80) {
      dragger.value.classList.add('_anim')
      currentY.value = container.value.clientHeight
      setTranslate()
      resetPosition()
    }
    else {
      currentY.value = 0
      currentX.value = 0
      setTranslate()
      if (isDragging.value) { dragger.value.classList.add('_anim') }
    }

    isDragging.value = false
  }

  onMounted(() => {
    if (!container.value) { return }
    container.value.addEventListener('touchstart', onDragStart)
    container.value.addEventListener('touchmove', onDragging)
    container.value.addEventListener('touchend', onDragEnd)
    container.value.addEventListener('mouseup', onDragEnd)
  })

  onUnmounted(() => {
    if (!container.value) { return }
    container.value.removeEventListener('touchstart', onDragStart)
    container.value.removeEventListener('touchmove', onDragging)
    container.value.removeEventListener('touchend', onDragEnd)
    container.value.removeEventListener('mouseup', onDragEnd)
  })

  const resetPosition = () => {
    onCloseModal()
  }

  const onCloseModal = () => {
    isDragging.value = false
    dragger.value.classList.add('_anim')
    currentY.value = container.value.clientHeight
    setTranslate()

    if (onClose) {
      setTimeout(() => {
        onClose()
        dragger.value.classList.remove('_anim')
        initialY.value = 0
        currentY.value = 0
        currentX.value = 0
        setTranslate()
      }, 300)
    }
  }

  return {
    onCloseModal
  }
}
