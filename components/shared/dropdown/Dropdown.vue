<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    }
  }
}
</script>

<template lang="pug">
.dropdown.d-button-cirle(:class="{ _active: active }")
  .dropdown__icon(v-if="icon"): div(:class="icon")
  .dropdown__title
    template(v-if="$slots.title"): slot(name="title")
    template(v-else) {{ title }}
  .dropdown__toogle: .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.dropdown
.dropdown.d-button-cirle
  cursor pointer
  display flex
  align-items stretch
  width auto
  height 44px
  margin-left auto
  padding $m6 $m7
  color var(--c-font-4)
  font-size 13px
  background var(--c-bg-4)
  border 1px solid var(--c-bg-5)
  border-radius $m5

  &:active:not(._disable)
    color var(--c-font-3)

  +media-hover()
    color var(--c-font-3)
    background var(--c-bg-5)

  &._noBd
    margin 0 -12px
    padding 0 12px
    font-size 16px
    background transparent
    box-shadow none
    border-color transparent

    &:hover:not(._disable)
      @media $media-laptop
        color var(--c-font-3)
        background var(--c-bg-1)
        border-color var(--c-bg-8)

  &._inline
    display inline-flex

  > div
    display flex
    align-items center

  &__icon
    opacity .6
    display flex
    align-items center
    justify-content center
    margin-right 6px
    font-size 22px

  &__title
    justify-content flex-start
    padding-right 12px
    flex-grow 1
    white-space nowrap

  &__toogle
    opacity .8
    justify-content center
    width 2px
    font-size 15px
    transform translateY(1px)
    flex-grow 0

    div
      anim-all()

      ^[0]._active &
        transform rotate(-180deg)
</style>
