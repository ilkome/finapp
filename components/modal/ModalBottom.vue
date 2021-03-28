<script>
import { ref, watch, reactive, toRefs } from '@nuxtjs/composition-api'
import useTouchClose from '~/components/base/modal/useTouchClose'

export default {
  name: 'ModalBottom',

  props: {
    isShow: {
      type: Boolean,
      default: true
    },

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

  setup (props, { listeners }) {
    const { isShow } = toRefs(props)
    const { initTouchModal, closeModal } = useTouchClose()

    const wrappers = reactive({
      container: ref(null),
      content: ref(null),
      handler: ref(null),
      overflow: ref(null),
      wrap: ref(null)
    })

    watch(isShow, (value) => {
      value && setTimeout(() => {
        initTouchModal({
          ...toRefs(wrappers),
          onClose: () => {
            if (listeners.onClose) {
              listeners.onClose()
            }
            if (listeners && listeners.afterClose) {
              listeners.afterClose()
            }
          }
        })
      }, 10)
    }, { immediate: true })

    return {
      ...toRefs(wrappers),
      closeModal
    }
  }
}
</script>

<template lang="pug">
.modalBottom(
  :style="{ maxHeight: `${$store.state.ui.height}px`}"
  :class="{ _center: center, _paddingless: paddingless }"
  v-show="isShow"
  ref="container"
)
  //- Overflow
  //--------------------------------------
  transition(name="baseModalOveflowAnim" appear)
    .modalBottom__overflow(
      v-show="isShow"
      ref="overflow"
      @click="closeModal"
    )

  //- Wrap
  //--------------------------------------
  transition(name="baseModalWrapAnim" appear)
    .modalBottom__wrap(
      v-show="isShow"
      ref="wrap"
    )
      //- Empty Header
      //--------------------------------------
      div(
        v-if="$slots.emptyHeader"
        @click="closeModal"
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
        ref="content"
      )
        //- Description
        slot(name="description")

        //- Buttons 3 collumns
        template(v-if="$slots.btns")
          .modalLinks
            slot(name="btns")

        //- Buttons 2 collumns
        .modalLinks._two
          slot(name="btnsTwo" :closeModal="closeModal")

        //- Default
        slot(:closeModal="closeModal")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

$transition-style = cubic-bezier(.17, .04, .03, 1)

.baseModalOveflowAnim
  &-enter-active
  &-leave-active
    opacity 1
    transition all 250ms $transition-style

  &-enter
  &-leave-to
    opacity 0

.baseModalWrapAnim
  &-enter-active
  &-leave-active
    opacity 0
    transform translate3d(0, 50px, 0)
    transition opacity 300ms $transition-style, transform 250ms $transition-style

  &-enter-to
    transform translate3d(0, 0, 0)

  &-leave
  &-enter-to
  &-leave-to
    opacity 1

  &-leave-to
    transform translate3d(0, 200%, 0)
    transition opacity 400ms $transition-style, transform 400ms $transition-style

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
  z-index 100
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
    anim()

  &__wrap
    // overflow hidden
    position relative
    display flex
    flex-grow 1
    flex-flow column nowrap
    max-width 440px
    margin-right auto
    background var(--c-bg-4)
    border-radius $m7 $m7 0 0

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
    border-radius $m7 $m7 0 0
    scrollbar()

    @media $media-laptop
      padding $m9
      border-radius $m7

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
