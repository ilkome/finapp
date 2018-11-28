<script>
import Icon from '@/components/icon/Icon'
import ModalBottom from '@/components/modal/ModalBottom'
import ModalButton from '@/components/modal/ModalButton'

export default {
  components: {
    Icon,
    ModalBottom,
    ModalButton
  },

  props: {
    color: {
      type: String,
      default: null
    },

    icon: {
      type: String,
      required: true
    },

    name: {
      type: String,
      default: null
    }
  },

  computed: {
    className () {
      return {
        _mobile: this.$store.state.ui.mobile,
        _pc: this.$store.state.ui.pc
      }
    }
  }
}
</script>

<template lang="pug">
.filterItem(
  :class="className"
  :style="{ background: color }"
  @click="$emit('onClick')"
)
  .filterIcon
    Icon(
      :icon="icon"
      :background="color"
    )
  .filterName {{ name }}
  .filterCloseBtn: .mdi.mdi-close
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.filterItem
  position relative
  display flex
  flex-flow row
  align-items center
  padding $m6 $m7
  color var(--c-font-1)
  border-radius $m3
  cursor pointer

  &:hover:not(._clear)
    .filterCloseBtn
      @media $media-laptop
        opacity 1

  &._pc
    margin-right $m7

  &._mobile
    margin-bottom $m7

  &:last-child
    margin-bottom 0

  &._clear
    margin-left auto
    margin-right 0
    color var(--c-font-1)
    background var(--c-bg-8)

    /.theme-light &
      background var(--c-bg-9)

    &:hover
      @media $media-laptop
        background var(--c-blue-1)

    @media $media-phone
      color var(--c-font-1)
      background var(--c-blue-1)
      border-radius $m3

    .icon
      @media $media-phone
        background var(--c-blue-1)

      @media $media-laptop
        opacity .8
        background transparent

.filterIcon
  opacity .8
  padding-right $m6
  color var(--c-font-1)

  .icon
    @media $media-laptop
      width auto
      height auto

.filterName
  overflow hidden
  text-overflow ellipsis
  text-align center

  @media $media-phone
    font-size 18px

.filterCloseBtn
  margin-left auto
  color var(--c-font-4)

  @media $media-phone
    font-size 22px

  @media $media-laptop
    opacity 0
    position absolute
    right (- $m6)
    top (- $m6)
    padding $m4
    background var(--c-bg-3)
    border 1px solid var(--c-bg-1)
    border-radius $m3
</style>
