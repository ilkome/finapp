<script>
import { ref } from '@nuxtjs/composition-api'
import useTouchClose from '~/composables/useTouchClose'

export default {
  name: 'BaseModal',

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

  setup (props, ctx) {
    const scrollContainer = ref(null)
    const scrollContent = ref(null)
    const scrollOverflow = ref(null)
    const scrollDragger = ref(null)

    useTouchClose({
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
      scrollDragger
    }
  },

  data () {
    return {
      headerHeight: 0
    }
  },

  computed: {
    modalStyle () {
      return {}
    }
  },

  methods: {
    afterClose () {
      if (this.$listeners.afterClose) {
        this.$listeners.afterClose()
      }
    },

    onClose () {
      this.$listeners.onClose()
    }
  }
}
</script>

<template lang="pug">
portal(to="modal" v-if="show")
  .baseModal(
    ref="scrollContainer"
    :class="{ _opened: show }"
  )
    transition(name="fadeIn" appear)
      .baseModal__overflow(
        v-show="show"
        ref="scrollOverflow"
        @click="onClose"
      )

    transition(name="hey" appear @after-leave="afterClose")
      .baseModal__wrap(
        ref="scrollDragger"
        v-show="show"
      )
        .baseModal__header(
          @click="onClose"
          ref="header"
        )
          .baseModal__header__title(v-if="title") {{ title }}
          .baseModal__header__close: .mdi.mdi-close

        .baseModal__scroll(
          :style="modalStyle"
          ref="scrollContent"
        )
          slot()
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/margins"

.baseModal
  z-index 10
  position fixed
  left 0

  &._opened
    width 100%
    height 100%

  @media $media-phone
    bottom 0

  @media $media-laptop
    top 0
    left 0px

  &__overflow
    position absolute
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
    z-index 2
    position absolute
    left 0
    bottom 0
    display flex
    width 100%
    flex-grow 1
    flex-flow column nowrap
    background var(--c-bg-2)
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
