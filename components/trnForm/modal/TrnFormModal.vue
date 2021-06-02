<script lang="ts">
import { ref, watch, reactive, toRefs } from '@nuxtjs/composition-api'
import useTouchClose from '~/components/base/modal/useTouchClose'

export default {
  props: {
    title: {
      type: String,
      default: null
    },

    isShow: {
      type: Boolean,
      required: false
    },

    position: {
      type: String,
      default: null
    },

    doNotTouchClassName: {
      type: String,
      default: null
    },

    noPadding: {
      type: Boolean,
      default: false
    }
  },

  setup (props: any, { listeners }) {
    const { isShow, doNotTouchClassName } = toRefs(props)
    const { initTouchModal, closeModal } = useTouchClose()

    const wrappers = reactive({
      container: ref(null),
      content: ref(null),
      handler: ref(null),
      overflow: ref(null),
      wrap: ref(null),
      config: {
        doNotTouchClassName: doNotTouchClassName.value ? doNotTouchClassName.value : 'doNotCloseTrnModalInside'
      }
    })

    watch(isShow, (value) => {
      if (value) {
        setTimeout(() => {
          initTouchModal({
            ...toRefs(wrappers),
            onClose: listeners.onClose
          })
        }, 10)
      }
    }, { immediate: true })

    return {
      ...toRefs(wrappers),
      closeModal
    }
  },

  data () {
    return {
      headerHeight: 0
    }
  },

  computed: {
    modalStyle (): any {
      if (this.$store.state.trnForm.height < this.$store.state.ui.height) {
        if (this.position === 'bottom') {
          return {
            maxHeight: `${this.$store.state.trnForm.height}px`
          }
        }
        return {
          height: `${this.$store.state.trnForm.height}px`
        }
      }
      else {
        return {
          height: `${this.$store.state.ui.height}px`
        }
      }
    }
  },

  methods: {
    afterClose () {
      if (this.$listeners.afterClose) {
        this.$listeners.afterClose()
      }
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
Portal(to="modal")
  .trnFormModal(
    ref="container"
    v-show="isShow"
  )
    transition(name="baseModalOveflowAnim" appear)
      .trnFormModal__overflow(
        v-show="isShow"
        ref="overflow"
        @click="closeModal"
      )

    transition(name="baseModalWrapAnim" appear)
      .trnFormModal__wrap(
        v-show="isShow"
        :style="modalStyle"
        ref="wrap"
      )
        .trnForm__handler(
          ref="handler"
          @click="closeModal"
        )
        .trnForm__closure(@click="closeModal")
          svg(
            viewBox='0 0 24 24'
            fill='none'
            stroke='#000'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='1.5'
          )
            path(d='M.75 23.249l22.5-22.5')
            path(d='M23.25 23.249L.75.749')

        .trnFormModal__scroll(
          :class="{ _noPadding: noPadding }"
          ref="content"
        )
          .trnForm__title(v-if="title") {{ title }}
          slot
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.baseModalOveflowAnim
  &-enter-active
  &-leave-active
    transition opacity 350ms ease

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

.trnFormModal
  z-index 100
  position absolute
  width 100%

  @media $media-laptop
    position absolute
    display grid
    margin $m7
    border-radius 16px

  @media $media-phone
    left 0
    bottom 0

  @media $media-laptop
    top 0
    right 0

  &__overflow
    position fixed
    left 0
    bottom 0
    width 100%
    height 100%
    background var(--c-bg-14)
    anim()

    @media $media-laptop
      opacity .1

  &__wrap
    overflow hidden
    position relative
    display flex
    flex-grow 1
    flex-flow column nowrap
    background var(--color-bg-canvas)

    @media $media-phone
      border-radius $m7 $m7 0 0

    @media $media-laptop
      align-self center
      width 400px
      margin 0 auto
      border-radius $m7

    &._anim
      anim(200ms)

  &__scroll
    overflow hidden
    overflow-y auto
    max-height 100%
    padding-bottom $m7
    scrollbar()

    &._noPadding
      overflow hidden
      display grid
      grid-template-rows auto 1fr
      display grid
      flex-grow 1
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
      text-align center

    &__close
      color var(--c-font-4)
      font-size 20px

  &__icon
    position absolute
    top -24px
    right $m7
</style>
