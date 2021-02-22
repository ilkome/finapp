<script lang="ts">
import { ref, watch, reactive, toRefs } from '@nuxtjs/composition-api'
import useTouchClose from '~/components/base/modal/useTouchClose.ts'

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

  // @ts-ignore
  setup (props: any, { listeners }) {
    const { isShow, doNotTouchClassName } = toRefs(props)
    const { initTouchModal, closeModal } = useTouchClose()

    console.log('doNotTouchClassName', doNotTouchClassName.value)

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
      // @ts-ignore
      if (this.$store.state.trnForm.height < this.$store.state.ui.height) {
        // @ts-ignore
        if (this.position === 'bottom') {
          return {
            // @ts-ignore
            maxHeight: `${this.$store.state.trnForm.height - this.headerHeight}px`
          }
        }
        return {
          // @ts-ignore
          height: `${this.$store.state.trnForm.height - this.headerHeight}px`
        }
      }
      else {
        return {
          // @ts-ignore
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
      // @ts-ignore
      if (this.$listeners.afterClose) {
        // @ts-ignore
        this.$listeners.afterClose()
      }
    },

    updateHeight () {
      // @ts-ignore
      this.$nextTick(() => {
        // @ts-ignore
        this.headerHeight = this.$refs.header.clientHeight
      })
    },

    onClose () {
      // @ts-ignore
      if (this.$listeners.onClose) {
        // @ts-ignore
        this.$listeners.onClose()
      }
    }
  }
}
</script>

<template lang="pug">
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
      ref="wrap"
    )
      .trnFormModal__header(
        ref="header"
        @click="closeModal"
      )
        .trnFormModal__header__title(v-if="title") {{ title }}
        .trnFormModal__header__close: .mdi.mdi-close

      .trnFormModal__scroll(
        :style="modalStyle"
        :class="{ _noPadding: noPadding }"
        ref="content"
      )
        slot
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/margins'

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
      anim(200ms)

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
      margin-bottom (- $m7)
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
