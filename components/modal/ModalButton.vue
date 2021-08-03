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

  .button-link__icon(v-if="$slots.icon")
    slot(name="icon")

  template(v-if="!$slots.icon")
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
  text-align center
  border 1px solid transparent
  border-radius $m6
  anim()

  &._active
    background var(--c-bg-3)
    border 1px solid var(--c-bg-6)

  +media-hover()
    &:not(._active)
      color var(--c-font-3)
      background var(--c-item-bg-hover)
      border 1px solid var(--c-item-bd-hover)

  &__icon
    opacity .8
    display flex
    align-items center
    justify-content center
    padding-bottom $m6
    color var(--c-font-2)
    font-size 32px


  &__name
    color var(--c-font-3)
    font-size 12px
    line-height 16px
</style>
