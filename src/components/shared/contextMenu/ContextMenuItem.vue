<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    checkValue: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClick () {
      this.$emit('onClick')
      if (this.$listeners.onClose) this.$listeners.onClose()
    }
  }
}
</script>

<template lang="pug">
.item(
  @click="handleClick"
  :class="{ _selected: selected }")
  .item__icon: div(:class="icon")
  .item__title {{ title }}
  .item__check(v-if="checkValue"): .mdi.mdi-check-circle-outline
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.item
  display flex
  align-items center
  padding 0 $m7
  font-size 14px
  white-space nowrap

  @media $media-phone
    height 46px

  @media $media-laptop
    height 40px

  &:active
    background var(--c-bg-2)
    /.theme-light &
      background var(--c-bg-7)

  &:hover
    @media $media-laptop
      background var(--c-bg-2)
      /.theme-light &
        background var(--c-bg-7)

  &._selected
    background var(--c-bg-4)
    /.theme-light &
      background var(--c-bg-4)

  &__icon
    width 24px
    margin-right $m6
    font-size 20px
    text-align center
    opacity .85

  &__title
    color var(--c-font-3)

  &__check
    opacity .80
    margin-left auto
    padding-left $m7
    color var(--c-incomes-1)
    font-size 20px
</style>
