<script lang="ts">
export default defineComponent({
  props: {
    background: { type: String, default: null },
    checkboxValue: { type: Boolean, default: false },
    className: { type: String, default: null },
    icon: { type: String, default: null },
    isShowDots: { type: Boolean, default: false },
    showCheckbox: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
    title: { type: String, default: null },
  },

  setup(props) {
    const classNames = computed(() => ({
      [`_size_${props.size}`]: props.size,
      [props.className]: props.className,
      '!pr-3': props.isShowDots,
    }))

    return { classNames }
  },
})
</script>

<template lang="pug">
.d-button(
  :class="classNames"
  :style="{ background: background }"
  @click="$emit('onClick')"
)
  .d-button__icon(v-if="icon")
    div(:class="icon")

  .d-button__title.grow(v-if="title") {{ title }}

  .d-button__check(
    v-if="showCheckbox"
    @click.prevent=""
  )
    SharedInputsCheckbox(v-model="checkboxValue")

  .mdi.mdi-dots-vertical.text-lg(v-if="isShowDots")
</template>

<style lang="stylus">
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/media'

.d-button-circle
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
    box-shadow 2px 2px 6px 0 var(--c-bg-2)

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

  +media-hover()
    color var(--c-font-1)
    background var(--c-bg-6)

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
    min-height 48px
    padding $m6 $m8
    color var(--c-text-4)
    font-size 14px
    text-decoration none
    background var(--c-bg-4)
    border 1px solid var(--c-bg-5)
    border-radius $m5

    +media-hover()
      color var(--c-text-1)
      background var(--c-item-bg-hover)
      border 1px solid var(--c-item-bd-hover)

  &._inline
    display flex
    width 100%
    max-width 220px
    margin 0 auto

  &._center
    align-items center
    justify-content center
    text-align center

  &._grey
    color var(--c-font-2)
    background var(--c-bg-5)
    border-radius $m3

    /.light &
      color var(--c-font-1)
      background var(--c-bg-12)

  &._small
    height 44px
    padding 0 $m9
    color var(--c-font-4)
    font-size 12px
    background var(--c-bg-3)
    border 1px solid var(--c-bg-7)
    border-radius $m6

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
        background var(--c-blue-3)

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

  &._maxWidth
    max-width 280px

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
    margin-right $m6
    margin-left -5px
    font-size 18px
    text-align center

    &:last-child
      margin-right 0
      margin-right -5px

    // +media-laptop()
    //   margin-right 10px
    //   margin-left -8px

  &__check
    margin-left auto
    padding-left 32px

  &__title
    ~/._text-center &
      flex-grow 1
      font-size 16px
      text-align center
</style>
