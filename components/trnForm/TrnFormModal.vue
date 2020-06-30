<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      required: true
    },
    position: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      headerHeight: 0,

      initialY: 0,
      currentY: 0,
      isDragging: false
    }
  },

  computed: {
    modalStyle () {
      if (this.$store.state.trnForm.height < this.$store.state.ui.height) {
        if (this.position === 'bottom') {
          return {
            maxHeight: `${this.$store.state.trnForm.height - this.headerHeight}px`
          }
        }
        return {
          height: `${this.$store.state.trnForm.height - this.headerHeight}px`
        }
      }
      else {
        return {
          height: `${this.$store.state.ui.height - this.headerHeight}px`
        }
      }
      // }
      // if (this.position === 'top') {
      // }
    }
  },

  watch: {
    show: {
      handler: 'updateHeight',
      immediate: true
    }
  },

  mounted () {
    this.adddListeners()
  },

  methods: {
    afterClose () {
      if (this.$listeners.afterClose) {
        this.$listeners.afterClose()
      }
    },

    updateHeight () {
      this.$nextTick(() => {
        this.headerHeight = this.$refs.header.clientHeight
      })
    },

    adddListeners () {
      const modalContainer = this.$refs.trnFormModal
      if (modalContainer) {
        modalContainer.addEventListener('touchstart', this.onDragStart, false)
        modalContainer.addEventListener('touchend', this.onDragEnd, false)
        modalContainer.addEventListener('touchmove', this.onDragging, false)
        modalContainer.addEventListener('mouseup', this.onDragEnd, false)
      }
    },

    onDragStart (e) {
      // stop trnFormModal drag when content has scroll
      // wait until content scroll up to top
      const scrollBlock = this.$refs.trnFormModal.querySelector('.trnFormModal__scroll')
      if (scrollBlock && scrollBlock.scrollTop > 0) {
        return
      }

      // same as above but for any block
      // const swiperSlideActive = this.$el.querySelector('.trnFormActiveSlide')
      // if (swiperSlideActive) {
      //   const sliderWithScroll = swiperSlideActive.querySelector('.waitForScroll')
      //   if (sliderWithScroll) {
      //     if (sliderWithScroll.scrollTop > 0) { return }
      //   }
      // }

      const dragItem = this.$refs.trnFormModal.querySelector('.trnFormModal__wrap')
      if (dragItem) {
        dragItem.classList.remove('_anim')

        if (e.type === 'touchstart') {
          this.initialY = e.touches[0].clientY
        }
        else {
          this.initialY = e.clientY
        }

        if (e.target.closest('.trnFormModal__wrap')) {
          this.isDragging = true
        }

        // if (e.target.closest('.noDrag')) {
        //   this.isDragging = false
        // }
      }
    },

    onDragging (e) {
      if (this.isDragging) {
        if (e.type === 'touchmove') {
          this.currentY = e.touches[0].clientY - this.initialY
        }
        else {
          this.currentY = e.clientY - this.initialY
          this.currentX = e.clientX - this.initialX
        }

        if ((Math.abs(this.currentY) < Math.abs(this.currentX))) {
          return
        }

        this.setTranslate()
      }
    },

    onDragEnd (e) {
      const dragItem = this.$refs.trnFormModal.querySelector('.trnFormModal__wrap')

      // do not close
      if (this.currentY >= 80) {
        dragItem.classList.add('_anim')
        this.currentY = this.$refs.trnFormModal.clientHeight
        this.setTranslate()
        this.onClose()
      }
      // close
      else {
        this.currentY = 0
        this.currentX = 0
        this.setTranslate()
        if (this.isDragging) { dragItem.classList.add('_anim') }
      }

      this.isDragging = false
    },

    setTranslate () {
      const modalHeight = this.$refs.trnFormModal.clientHeight
      const diff = (modalHeight - this.currentY) / (modalHeight / 100)
      const diffTrunc = Math.trunc(diff)

      const modalContainer = this.$refs.trnFormModal
      const dragItem = modalContainer.querySelector('.trnFormModal__wrap')
      const overflow = modalContainer.querySelector('.trnFormModal__overflow')

      if (this.currentY === 0 && dragItem) {
        dragItem.style.transform = ''
        overflow.style.opacity = ''
      }
      else if (this.currentY > 0 && dragItem) {
        dragItem.style.transform = `translate3d(0, ${this.currentY}px, 0)`
        overflow.style.opacity = diffTrunc === 100 ? 1 : `0.${diffTrunc}`
      }
    },

    onClose () {
      this.initialY = 0
      this.currentY = 0
      this.isDragging = false

      if (this.$listeners.onClose) {
        this.$listeners.onClose()
      }
    }
  }
}
</script>

<template lang="pug">
.trnFormModal.noDrag(ref="trnFormModal")
  transition(name="fadeIn" appear)
    .trnFormModal__overflow(
      v-show="show"
      @click="onClose"
    )

  transition(name="slide" appear v-on:after-leave="afterClose")
    .trnFormModal__wrap(v-show="show")
      .trnFormModal__header(
        @click="onClose"
        ref="header"
      )
        .trnFormModal__header__title(v-if="title") {{ title }}
        .trnFormModal__header__close: .mdi.mdi-close

      .trnFormModal__scroll(:style="modalStyle")
        slot()
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/margins"

.trnFormModal
  z-index 3
  position absolute
  left 0
  width 100%

  @media $media-phone
    bottom 0

  @media $media-laptop
    top 0
    left 0px

  &__overflow
    position fixed
    left 0
    bottom 0
    width 100%
    height 100%
    background var(--c-bg-overflow)
    anim()

    @media $media-laptop
      display none

  &__wrap
    overflow hidden
    position relative
    display flex
    flex-grow 1
    flex-flow column nowrap
    background var(--c-bg-4)
    border-radius $m6

    &._anim
      anim(400ms)

    @media $media-phone
      border-radius $m6 $m6 0 0

    /.light-mode &
      background var(--c-bg-2)

  &__scroll
    overflow hidden
    overflow-y auto
    max-height 100%
    padding $m7 0
    scrollbar()

  &__header
    cursor pointer
    position relative
    display flex
    align-items center
    justify-content space-between
    padding $m7
    color var(--c-font-3)
    font-size 22px
    font-weight 700
    letter-spacing 1px
    fontFamilyNunito()

    /.light-mode &
      color var(--c-font-4)

    &:hover
    &:active
      background var(--c-bg-5)

    &__title
      flex-grow 1

    &__close
      color var(--c-font-4)
      font-size 20px

  &__icon
    position absolute
    top -24px
    right $m7
</style>
