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
  .dropdown__toogle: .mdi.mdi-chevron-down
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.dropdown
.dropdown.d-button-cirle
  display flex
  align-items stretch
  width auto
  margin-left auto
  border-radius $m3
  font-size 16px
  text-transform capitalize

  &._inline
    display inline-flex

  > div
    display flex
    align-items center

  &__icon
    display flex
    align-items center
    justify-content center
    font-size 22px
    margin-right (- $m4)
    padding-left $m6
    opacity .8

  &__title
    flex-grow 1
    padding 0 $m7
    white-space nowrap
    justify-content flex-start

    @media $media-phone-sm
      padding 0 $m6

  &__toogle
    flex-grow 0
    padding 0 $m6
    font-size 18px
    border-left 1px solid var(--c-bg-7)
    justify-content center

    ^[0]:hover &
      @media $media-laptop
        border-left 1px solid var(--c-bg-8)

    div
      anim-all()

      ^[0]._active &
        transform rotate(-180deg)
</style>
