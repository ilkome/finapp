
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
  .checkbox__title(v-if="title") {{ title }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.checkbox
  --width 3.3em
  --height 1.5em
  --left 1.7em
  cursor pointer
  position relative
  display flex
  align-items center
  font-size 16px
  $color-rail = var(--c-font-2)

  +media-laptop()
    font-size 14px

  &._small
    --width 2.4em
    --height 1.4em
    --left 1.2em

  &__title
    padding 0 1em
    font-size 1em

  &__input[type='checkbox']
    opacity 0
    position absolute

    &:checked
      + .checkbox__helper:before
        background var(--c-blue-1)
        box-shadow inset 0px 1px 1px background var(--c-bg-12)
        ^[0]._alt &
          background var(--c-bg-7)

      + .checkbox__helper:after
        left var(--left)
        animation switch .2s ease-out

  &__helper
    cursor pointer
    position relative
    width var(--width)
    height var(--height)
    flex-shrink 0
    &:before
      position absolute
      top .5px
      left 0
      width var(--width)
      height var(--height)
      background var(--c-bg-8)
      border-radius 50px
      transition background .1s ease
      content ''

    // trail
    &:after
      z-index 1
      position absolute
      left 0em
      width var(--height)
      height var(--height)
      background $color-rail
      border-radius 50px
      box-shadow 0px 2px 5px 0px rgba(0, 0, 0, .3)
      transition all .2s ease
      content ''
      animation switch .2s ease-out
      /.light-mode &
        background var(--c-bg-1)

  &__toogle
    position absolute
    top 0
    right 0
    display flex
    align-items center
    width var(--width)
    height var(--height)
    padding 0 .3em
    padding-top .1em
    ^[0]._small &
      padding-right .02em
      padding-left .02em

    &__item
      color var(--c-font-2)
      font-size .7em
      text-align center
      text-transform uppercase
      flex 1 1
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
