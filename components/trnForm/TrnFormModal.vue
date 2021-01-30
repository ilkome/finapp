<script>
import { ref } from '@nuxtjs/composition-api'
import useTouchClose from '~/composables/useTouchClose'

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
    },

    noPadding: {
      type: Boolean,
      default: false
    }
  },

  setup (props, ctx) {
    const scrollContainer = ref(null)
    const scrollContent = ref(null)
    const scrollOverflow = ref(null)
    const scrollDragger = ref(null)

    const { onCloseModal } = useTouchClose({
      container: scrollContainer,
      content: scrollContent,
      overflow: scrollOverflow,
      dragger: scrollDragger,
      onClose: () => ctx.listeners.onClose && ctx.listeners.onClose()
    })

    return {
      scrollContainer,
      scrollContent,
      scrollOverflow,
      scrollDragger,
      onCloseModal
    }
  },

  data () {
    return {
      headerHeight: 0
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
    }
  },

  watch: {
    show: {
      handler: 'updateHeight',
      immediate: true
    }
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

    onClose () {
      if (this.$listeners.onClose) {
        this.$listeners.onClose()
      }
    }
  }
}
</script>

<template lang="pug">
.trnFormModal.noDrag(ref="scrollContainer")
  transition(name="fadeIn" appear)
    .trnFormModal__overflow(
      v-show="show"
      ref="scrollOverflow"
      @click="onCloseModal"
    )

  transition(name="slide" appear @after-leave="afterClose")
    .trnFormModal__wrap(
      v-show="show"
      ref="scrollDragger"
    )
      .trnFormModal__header(
        ref="header"
        @click="onCloseModal"
      )
        .trnFormModal__header__title(v-if="title") {{ title }}
        .trnFormModal__header__close: .mdi.mdi-close

      .trnFormModal__scroll(
        :style="modalStyle"
        :class="{ _noPadding: noPadding }"
        ref="scrollContent"
      )
        slot()
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/margins'

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
    background var(--c-bg-14)
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

    &._noPadding
      overflow hidden
      padding-bottom 0

  &__header
    cursor pointer
    position relative
    display flex
    align-items center
    justify-content space-between
    padding $m7
    padding-bottom $m6
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
