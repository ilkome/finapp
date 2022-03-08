<script>
export default {
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: false },
  },
}
</script>

<template lang="pug">
.modalButton(
  :class="{ _active: isActive }"
  @click="$emit('onClick')"
)

  .modalButton__icon.pb-2(v-if="$slots.icon")
    slot(name="icon")

  template(v-if="!$slots.icon && icon")
    .modalButton__icon.pb-2
      .text-3xl(:class="icon")

  .modalButton__name.text-xs {{ name }}
</template>

<style lang="stylus" scoped>
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
    display flex
    align-items center
    justify-content center

  &__name
    color var(--c-font-3)
    line-height 16px

    ~/._active &
      color var(--c-blue-1)
</style>
