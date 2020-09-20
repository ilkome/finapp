<script>
import { ref } from 'nuxt-composition-api'
import useTouchClose from '~/composables/useTouchClose'

export default {
  props: {
    center: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      required: true
    },
    paddingless: {
      type: Boolean,
      default: false
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
      onClose: () => {
        ctx.listeners.onClose && ctx.listeners.onClose()
        ctx.listeners.afterClose && ctx.listeners.afterClose()
      }
    })

    return {
      scrollContainer,
      scrollContent,
      scrollOverflow,
      scrollDragger
    }
  },

  methods: {
    afterClose () {
      if (this.$listeners.afterClose) {
        this.$listeners.afterClose()
      }
    }
  }
}
</script>

<template lang="pug">
.modalBottom.noDrag(
  :style="{ maxHeight: `${$store.state.ui.height}px`}"
  :class="{ _center: center, _paddingless: paddingless }"
  ref="scrollContainer"
)

  transition(name="fadeIn" appear)
    .modalBottom__overflow(
      v-show="show"
      ref="scrollOverflow"
      @click="$listeners.onClose"
    )

  transition(name="slide" appear @after-leave="afterClose")
    .modalBottom__wrap(
      v-show="show"
      ref="scrollDragger"
    )
      //- Header
      .modalBottom__header(
        @click="$listeners.onClose"
        ref="header")
        template(v-if="$slots.header")
          slot(name="header")
        template(v-else)
          .modalBottom__header__back: .mdi.mdi-chevron-left
          .modalBottom__header__title(v-if="title") {{ title }}

      //- Content
      .modalBottom__scroll(
        :style="{ maxHeight: `${$store.state.ui.height - 100}px`}"
        ref="scrollContent"
      )
        slot(name="description")

        template(v-if="$slots.btns")
          .modalLinks._noPadding
            slot(name="btns")

        slot
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/media"

.modalBottom
  &__wrap
    ^[0]._center &
      @media $media-laptop
        margin 0 auto
</style>

<style lang="stylus">
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.modalBottom
  z-index 4
  position fixed
  left 0
  bottom 0
  width 100%
  height auto
  max-height calc(100vh - 80px)

  &__overflow
    position fixed
    left 0
    bottom 0
    width 100%
    height 100%
    background var(--c-bg-overflow)

  &__wrap
    position relative
    display flex
    flex-grow 1
    flex-flow column nowrap
    max-width 440px
    margin-right auto

    @media $media-laptop
      max-width 460px
      margin 100px

  &__scroll
    overflow hidden
    overflow-y auto
    max-height calc(90vh - 80px)
    padding $m7
    background var(--c-bg-3)
    border-radius 0 0 $m3 $m3
    scrollbar()

    @media $media-laptop
      padding $m9

    ^[0]._paddingless &
      padding 0


    /.light-mode &
      background var(--c-bg-2)

  &__header
    display flex
    align-items center
    position relative
    padding $m7
    color var(--c-font-1)
    background var(--c-bg-3)
    border-radius $m6 $m6 0 0

    /.light-mode &
      color var(--c-font-4)
      background var(--c-bg-1)

    &._alt
      background var(--c-bg-1)
      border-bottom 1px solid var(--c-bg-1)

    @media $media-laptop
      .walletItem
        margin 0

        &:hover
          background none

    // NEED FIX
    .trnItem
    .walletItem
      flex-grow 1
      padding 0

    .walletItem__line
      padding 0

    &:active
      background var(--c-bg-6)

    &:hover
      @media $media-laptop
        background var(--c-bg-6)

    &__title
      font-size 18px

    &__back
      margin-top $m2
      margin-right $m5
      font-size 18px

  &__icon
    position absolute
    right $m7
    top (- $m5)

  &__child
    display flex
    align-items center
    padding-left $m6
    font-size 18px
    font-weight 500
</style>
