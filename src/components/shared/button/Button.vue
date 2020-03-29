<script>
import Icon from '@/components/icon/Icon'
import Checkbox from '@/components/shared/inputs/Checkbox'

export default {
  components: {
    Icon,
    Checkbox
  },

  props: {
    background: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    className: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    checkboxValue: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template lang="pug">
.d-button(
  :class="className"
  :style="{ background: background }"
  @click="$emit('onClick')"
)
  .d-button__icon(v-if="icon")
    div(:class="icon")
  .d-button__title(v-if="title") {{ title }}
  .d-button__check(v-if="showCheckbox" @click.prevent="")
    Checkbox._small(v-model="checkboxValue")

</template>

<style lang="stylus">
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/media"
.d-button-cirle
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  font-size 16px
  color var(--c-font-4)
  background var(--c-bg-2)
  border 1px solid var(--c-bg-7)
  box-shadow 2px 2px 6px 0px var(--c-bg-2)
  border-radius 50px

  /.theme-light &
    box-shadow 2px 2px 6px 0px var(--c-bg-11)

  &:active:not(._disable)
    color var(--c-font-3)
    transform scale(0.96)

  &:hover:not(._disable)
    @media $media-laptop
      color var(--c-font-3)
      background var(--c-bg-1)
      border-color var(--c-bg-8)

  &._disable
    opacity .6
</style>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/fonts"

.d-button
  width 100%
  display flex
  align-items center
  padding $m7 $m8
  color var(--c-font-2)
  cursor pointer
  border-radius $m3
  font-size 15px
  anim-background()
  border 1px solid transparent

  +media-laptop()
    font-size 14px
    padding 12px 20px

  &:active
    transform scale(0.96)

  &._center
    text-align center

  &._border
    display flex
    align-items center
    justify-content center
    background var(--c-bg-2)
    border 1px solid var(--c-bg-7)
    box-shadow 2px 2px 6px 0px var(--c-bg-2)
    border-radius 3px
    anim()

    /.theme-light &
      box-shadow 2px 2px 6px 0px var(--c-bg-11)

    &:active:not(._disable)
      color var(--c-font-3)
      transform scale(0.96)

    +media-laptop()
      &:hover
        border-color var(--c-bg-9)

  &._square
    width 40px
    height 40px

  &._bdb
    padding 12px $m7
    border 1px solid var(--c-bg-5)
    &:hover
      @media $media-laptop
        background var(--c-bg-5)
    &:active
      background var(--c-bg-5)

  &._inline
    display inline-flex
    width auto

  &._center
    align-items center
    justify-content center

  &._grey
    background var(--c-bg-5)
    color var(--c-font-2)
    border-radius $m3

    /.theme-light &
      color var(--c-font-1)
      background var(--c-bg-12)

    &:hover
      @media $media-laptop
        background var(--c-bg-6)
        /.theme-light &
          background var(--c-bg-13)

  &._small
    height 40px
    padding 0 $m7
    color var(--c-font-4)
    background var(--c-bg-2)
    border 1px solid var(--c-bg-7)
    box-shadow 2px 2px 6px 0px var(--c-bg-2)
    border-radius $m3

    /.theme-light &
      box-shadow 2px 2px 6px 0px var(--c-bg-11)

    ^[0]:active &
      color var(--c-font-3)
      transform scale(0.96)

    ^[0]:hover &
      @media $media-laptop
        color var(--c-font-3)
        background var(--c-bg-1)
        border-color var(--c-bg-8)

  &._blue
    color var(--c-font-1)
    background var(--c-blue-1)
    // border 1px solid transparent

    &:hover
      @media $media-laptop
        background var(--c-blue-2)

  &__icon
    width 22px
    margin-left -5px
    margin-right $m6
    font-size 18px
    text-align center
    opacity .85

    &:last-child
      margin-right 0
      margin-right -5px

    +media-laptop()
      margin-left -8px
      margin-right 10px
      font-size 14px

  &__check
    margin-left auto
    padding-left 32px

  &__title
    ~/._text-center &
      flex-grow 1
      text-align center
</style>
