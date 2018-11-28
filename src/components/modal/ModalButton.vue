<script>
import Icon from '@/components/icon/Icon'

export default {
  components: {
    Icon
  },

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
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.button-link
  width auto
  max-width 100%
  padding $m7 0
  white-space nowrap
  text-align center
  background var(--c-bg-5)
  border-radius $m3

  /.theme-light &
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
</style>
