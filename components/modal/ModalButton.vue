<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }
}
</script>

<template lang="pug">
.button-link(@click="$emit('onClick')")
  .button-link__icon: div(:class="icon")
  .button-link__name {{ name }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.button-link
  width auto
  max-width 100%
  padding $m7 0
  white-space nowrap
  text-align center
  background var(--c-bg-5)
  border-radius $m3

  /.light-mode &
    background var(--c-bg-1)
    color var(--c-font-2)

  &__icon
    font-size 32px
    padding-bottom $m6
    color var(--c-font-4)
    opacity .8

  &:hover
    @media $media-laptop
      background var(--c-bg-6)

  &:active
    background var(--c-bg-6)

  &__name
    font-size 12px
</style>
