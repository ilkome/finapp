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
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.dropdown
.dropdown.d-button-cirle
  display flex
  align-items stretch
  width auto
  padding 0 12px
  margin-left auto
  border-radius $m3
  font-size 16px

  &._noBd
    padding 0 12px
    margin 0 -12px
    background transparent
    border-color transparent
    box-shadow none

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
    display flex
    align-items center
    justify-content center
    font-size 18px
    margin-right 6px
    opacity .8

  &__title
    flex-grow 1
    white-space nowrap
    justify-content flex-start
    padding-right 12px

  &__toogle
    width 4px
    flex-grow 0
    font-size 18px
    justify-content center

    div
      anim-all()

      ^[0]._active &
        transform rotate(-180deg)
</style>
