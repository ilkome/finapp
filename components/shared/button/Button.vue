<script>
export default {
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
    },

    size: {
      type: String,
      default: 'md'
    }
  },

  computed: {
    classNameComputed () {
      return {
        [`_size_${this.size}`]: this.size,
        [this.className]: this.className
      }
    }
  }
}
</script>

<template lang="pug">
.d-button(
  :class="classNameComputed"
  :style="{ background: background }"
  @click="$emit('onClick')"
)
  .d-button__icon(v-if="icon")
    div(:class="icon")
  .d-button__title(v-if="title") {{ title }}
  .d-button__check(
    v-if="showCheckbox"
    @click.prevent=""
  )
    SharedInputsCheckbox._small(v-model="checkboxValue")

</template>

<style lang="stylus">
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/media'

.d-button-cirle
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  color var(--c-font-4)
  font-size 16px
  border-radius 50px

  &:active:not(._disable)
    color var(--c-font-3)
    background var(--c-bg-2)
    box-shadow 2px 2px 6px 0px var(--c-bg-2)

  &:hover:not(._disable)
    @media $media-laptop
      color var(--c-font-3)
      background var(--c-bg-1)
      border-color var(--c-bg-8)

  &._disable
    opacity .6

  &:active
    background var(--c-bg-3)
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/fonts'

.d-button
  cursor pointer
  display flex
  align-items center
  width 100%
  padding $m7 $m8
  color var(--c-font-2)
  font-size 15px
  border 1px solid transparent
  border-radius $m3
  anim-background()

  +media-laptop()
    padding 12px 20px
    font-size 14px

  &:active
    background var(--c-bg-3)

  &._ttu
    text-transform uppercase

  &._borderBottom
    width 100%
    margin-bottom 0
    padding $m7 $m7
    border-radius $m5

  &._border
    display flex
    align-items center
    justify-content center
    margin 0 auto
    padding $m6 $m6
    color var(--c-font-4)
    font-size 13px
    background var(--c-bg-4)
    border 1px solid var(--c-bg-5)
    border-radius $m5
    anim()

    &:active:not(._disable)
      color var(--c-font-3)

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
        background var(--c-bg-4)
    &:active
      background var(--c-bg-4)

  &._inline
    display flex
    width 100%
    max-width 220px
    margin 0 auto

    @media $media-laptop
      display inline-flex
      width auto
      margin 0

  &._center
    align-items center
    justify-content center
    text-align center

  &._grey
    color var(--c-font-2)
    background var(--c-bg-5)
    border-radius $m3

    /.light-mode &
      color var(--c-font-1)
      background var(--c-bg-12)

    &:hover
      @media $media-laptop
        background var(--c-bg-6)
        /.light-mode &
          background var(--c-bg-13)

  &._small
    height 40px
    padding 0 $m8
    color var(--c-font-4)
    font-size 12px
    background var(--c-bg-3)
    border 1px solid var(--c-bg-5)
    border-radius $m4

    ^[0]:active &
      color var(--c-font-3)

    ^[0]:hover &
      @media $media-laptop
        color var(--c-font-3)
        background var(--c-bg-1)
        border-color var(--c-bg-8)

  &._blue
    color var(--c-font-1)
    background var(--c-blue-1)

    &:hover
      @media $media-laptop
        background var(--c-blue-2)

  &._blue2
    cursor pointer
    max-width 320px
    min-width 200px
    margin 0 auto
    padding $m7 $m7
    color var(--c-font-1)
    font-size 16px
    text-align center
    background var(--c-blue-3)
    border-radius 36px
    anim()

    +media-hover()
      background var(--c-blue-1)

  &._size_lg
    padding 16px
    font-size 16px
    border-radius 6px

  &._size_xl
    padding 22px 36px
    font-size 22px
    border-radius 6px

  &__icon
    opacity .85
    width 22px
    margin-right $m6
    margin-left -5px
    font-size 18px
    text-align center

    &:last-child
      margin-right 0
      margin-right -5px

    +media-laptop()
      margin-right 10px
      margin-left -8px
      font-size 14px

  &__check
    margin-left auto
    padding-left 32px

  &__title
    ~/._text-center &
      flex-grow 1
      font-size 16px
      text-align center
</style>
