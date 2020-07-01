<script>
export default {
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
  @click="$emit('onClick')")
  .filterItem__icon
    Icon(
      :icon="icon"
      :medium="true"
      :background="color")
  .filterItem__name {{ name }}
  .filterItem__close: .mdi.mdi-close
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.filterItem
  cursor pointer
  position relative
  display flex
  flex-flow row
  align-items center
  padding 8px 12px
  color var(--c-font-1)
  white-space nowrap
  border-radius $m3

  &._pc
    margin-right 20px

  &._mobile
    flex 1 1 50%
    margin-right 10px

  &:last-child
    margin-right 0

  &._clear
    margin-left auto
    margin-right 0
    color var(--c-font-4)

    &:hover
      @media $media-laptop
        color var(--c-font-1)
        background var(--c-blue-1)

  &__icon
    opacity .8
    padding-right $m6
    color var(--c-font-1)

    .icon
      width auto
      height auto

      ^[0]._clear &
        color var(--c-font-4)

      ^[0]:hover &
        color var(--c-font-1)

  &__name
    overflow hidden
    text-overflow ellipsis
    font-size 14px
    text-align center

  &__close
    margin-left auto
    padding-left 10px
    color var(--c-font-1)

    @media $media-laptop
      opacity 0
      position absolute
      top (- $m6)
      right (- $m6)
      padding $m4
      background var(--c-bg-3)
      border 1px solid var(--c-bg-1)
      border-radius $m3
      anim()

      /.light-mode &
        color var(--c-font-2)
        background var(--c-bg-10)

    ^[0]:hover:not(._clear) &
      @media $media-laptop
        opacity 1
</style>
