<script>
export default {
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: false }
  }
}
</script>

<template lang="pug">
.modalButton(
  :class="{ _active: isActive }"
  @click="$emit('onClick')"
)

  .modalButton__icon(v-if="$slots.icon")
    slot(name="icon")

  template(v-if="!$slots.icon && icon")
    .modalButton__icon: div(:class="icon")

  .modalButton__name {{ name }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.modalButton
  cursor pointer
  display flex
  align-items center
  flex-flow column
  justify-content center
  width auto
  max-width 100%
  min-height 48px
  padding $m6 $m6
  text-align center
  border 1px solid transparent
  border-radius $m6

  &._active
    cursor default
    background var(--c-item-bg-hover)

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

    ~/._active &
      color var(--c-blue-1)

  &__name
    color var(--c-font-3)
    font-size 12px
    line-height 16px

    ~/._active &
      color var(--c-blue-1)
</style>
