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
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template lang="pug">
.button-link(
  :class="{ _active: isActive }"
  @click="$emit('onClick')"
)
  .button-link__icon: div(:class="icon")
  .button-link__name {{ name }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.button-link
  cursor pointer
  width auto
  max-width 100%
  padding $m6 $m6
  white-space nowrap
  text-align center
  border-radius $m5

  &__icon
    opacity .8
    padding-bottom $m6
    color var(--c-font-2)
    font-size 32px

  &:hover
    @media $media-laptop
      background var(--c-bg-3)

  &:active
    background var(--c-bg-3)

  &._active
    background var(--c-bg-3)
    border 1px solid var(--c-bg-6)

  &__name
    color var(--c-font-3)
    font-size 12px
</style>
