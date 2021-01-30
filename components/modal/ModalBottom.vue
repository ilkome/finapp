<script>
import { ref } from '@nuxtjs/composition-api'
import useTouchClose from '~/composables/useTouchClose'

export default {
  name: 'ModalBottom',

  props: {
    center: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
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

    const { onCloseModal } = useTouchClose({
      container: scrollContainer,
      content: scrollContent,
      overflow: scrollOverflow,
      dragger: scrollDragger,
      onClose: () => {
        if (ctx.listeners.onClose) {
          ctx.listeners.onClose()
        }
        if (ctx.listeners && ctx.listeners.afterClose) {
          ctx.listeners.afterClose()
        }
      }
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
      isShowed: false
    }
  },

  mounted () {
    this.isShowed = true
  }
}
</script>

<template lang="pug">
.modalBottom.noDrag(
  :style="{ maxHeight: `${$store.state.ui.height}px`}"
  :class="{ _center: center, _paddingless: paddingless }"
  ref="scrollContainer"
)
  //- Overflow
  //--------------------------------------
  transition(name="fadeIn" appear)
    .modalBottom__overflow(
      v-if="isShowed"
      ref="scrollOverflow"
      @click="onCloseModal"
    )

  //- Wrap
  //--------------------------------------
  transition(
    appear
    name="slide2"
    @after-leave="afterClose"
  )
    .modalBottom__wrap(
      v-if="isShowed"
      ref="scrollDragger"
    )
      //- Empty Header
      //--------------------------------------
      div(
        v-if="$slots.emptyHeader"
        @click="onCloseModal"
      )
        slot(name="emptyHeader")

      //- Header
      //--------------------------------------
      .modalBottom__header(v-if="$slots.header || title")
        //- Slot
        template(v-if="$slots.header")
          slot(name="header")

        //- Title
        template(v-if="title")
          .modalBottom__header__title(v-if="title") {{ title }}

      //- Content
      //--------------------------------------
      .modalBottom__scroll(
        :style="{ maxHeight: `${$store.state.ui.height - 100}px`}"
        ref="scrollContent"
      )
        //- Description
        slot(name="description")

        //- Buttons 3 collumns
        template(v-if="$slots.btns")
          .modalLinks
            slot(name="btns")

        //- Buttons 2 collumns
        .modalLinks._two
          slot(name="btnsTwo" :closeModal="onCloseModal")

        //- Default
        slot(:closeModal="onCloseModal")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.modalBottom
  &__wrap
    &._anim
      anim()

    ^[0]._center &
      @media $media-laptop
        margin 0 auto
</style>

<style lang="stylus">
@import '~assets/stylus/variables'

.modalBottom
  z-index 10
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
    background var(--c-bg-14)

  &__wrap
    position relative
    display flex
    flex-grow 1
    flex-flow column nowrap
    max-width 440px
    margin-right auto
    border-radius 0 0 $m7 $m7

    @media $media-laptop
      max-width 460px
      margin 100px
      border-radius $m7

  &__scroll
    overflow hidden
    overflow-y auto
    max-height calc(90vh - 80px)
    padding $m7
    background var(--c-bg-4)
    scrollbar()

    @media $media-laptop
      padding $m9
      border-radius 0 0 $m7 $m7

    ^[0]._paddingless &
      padding 0

  &__header
    flex-grow 1
    position relative
    display flex
    align-items center
    padding $m7
    color var(--c-font-2)
    fontFamilyNunito()
    background var(--c-bg-4)
    border-radius $m7 $m7 0 0

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

    &__title
      font-size 28px
      font-weight 700
      text-align center
      flex-grow 1

  &__icon
    position absolute
    top (- $m5)
    right $m7

  &__child
    display flex
    align-items center
    padding-left $m6
    font-size 18px
    font-weight 500
</style>
