
<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<template lang="pug">
label.checkbox
  input.checkbox__input(
    type="checkbox"
    :checked="value"
    v-on:input="$emit('input', $event.target.checked)"
  )
  .checkbox__helper: .checkbox__toogle
  .checkbox__title {{ title }}
</template>

<style lang="stylus" scoped>
$width = 3.4em
$height = 1.6em
$left = 1.8em
$color-rail = var(--c-font-2)

.checkbox
  position relative
  display flex
  align-items center
  font-size 16px

  &__title
    padding 0 1em
    font-size 1em

  &__input[type=checkbox]
    position absolute
    opacity 0

    &:checked
      + .checkbox__helper:before
        background var(--c-incomes-1)
        box-shadow inset 0px 1px 1px rgba(84, 152, 140, 0.5)

      + .checkbox__helper:after
        animation switch .2s ease-out
        left $left

  &__helper
    flex-shrink 0
    position relative
    width $width
    height $height
    cursor pointer

    &:before
      content ''
      position absolute
      width $width
      height $height
      left 0
      transition background 0.1s ease
      background var(--c-bg-8)
      border-radius 50px

    // trail
    &:after
      z-index 1
      content ''
      position absolute
      width $height
      height $height
      border-radius 50px
      left 0em
      transition all 0.2s ease
      background $color-rail
      animation switch .2s ease-out
      box-shadow 0px 2px 5px 0px rgba(0, 0, 0, 0.3)

      /.theme-light &
        background var(--c-bg-1)

  &__toogle
    position absolute
    right 0
    top 0
    display flex
    align-items center
    width $width
    height $height
    padding 0 .3em
    padding-top .1em

    &:before
    &:after
      flex 1 1
      color var(--c-font-2)
      font-size .7em
      text-align center
      text-transform uppercase
      /.theme-light &
        color var(--c-font-1)

    &:before
      content 'on'

    &:after
      content 'off'

@keyframes switch
  50%
    transform scaleX(1.3)
</style>
