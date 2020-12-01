
<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: null
    },
    alt: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template lang="pug">
label.checkbox(:class="{ _alt: alt }")
  input.checkbox__input(
    type="checkbox"
    :checked="value"
    @input="$emit('input', $event.target.checked)"
  )
  .checkbox__helper
    .checkbox__toogle
      .checkbox__toogle__item._on {{ $t('base.on') }}
      .checkbox__toogle__item._off {{ $t('base.off') }}
  .checkbox__title(v-if="title") {{ title }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.checkbox
  position relative
  display flex
  align-items center
  font-size 16px
  cursor pointer

  --width 3.3em
  --height 1.5em
  --left 1.7em
  $color-rail = var(--c-font-2)

  +media-laptop()
    font-size 14px

  &._small
    --width 2.6em
    --height 1.2em
    --left 1.5em

  &__title
    padding 0 1em
    font-size 1em

  &__input[type=checkbox]
    opacity 0
    position absolute

    &:checked
      + .checkbox__helper:before
        background var(--c-bg-1)
        box-shadow inset 0px 1px 1px background var(--c-bg-12)
        ^[0]._alt &
          background var(--c-bg-7)

      + .checkbox__helper:after
        animation switch .2s ease-out
        left var(--left)

  &__helper
    flex-shrink 0
    position relative
    width var(--width)
    height var(--height)
    cursor pointer
    &:before
      content ''
      position absolute
      width var(--width)
      height var(--height)
      left 0
      transition background 0.1s ease
      background var(--c-bg-8)
      border-radius 50px
      top .5px

    // trail
    &:after
      z-index 1
      content ''
      position absolute
      width var(--height)
      height var(--height)
      border-radius 50px
      left 0em
      transition all 0.2s ease
      background $color-rail
      animation switch .2s ease-out
      box-shadow 0px 2px 5px 0px rgba(0, 0, 0, 0.3)
      /.light-mode &
        background var(--c-bg-1)

  &__toogle
    position absolute
    right 0
    top 0
    display flex
    align-items center
    width var(--width)
    height var(--height)
    padding 0 .3em
    padding-top .1em
    ^[0]._small &
      padding-left .02em
      padding-right .02em

    &__item
      flex 1 1
      color var(--c-font-2)
      font-size .7em
      text-align center
      text-transform uppercase
      ^[0]._small &
        font-size .5em
      /.light-mode &
        color var(--c-font-1)
    &._on
      content 'on'
    &._off
      content 'off'

@keyframes switch
  50%
    transform scaleX(1.3)
</style>
