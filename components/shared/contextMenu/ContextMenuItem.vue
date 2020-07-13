<script>
export default {
  props: {
    icon: {
      type: String,
      default: null
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
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    checkboxValue: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClick () {
      this.$emit('onClick')
      if (this.$listeners.onClose) { this.$listeners.onClose() }
    }
  }
}
</script>

<template lang="pug">
.item(
  @click="handleClick"
  :class="{ _selected: selected }")
  .item__icon(v-if="icon"): div(:class="icon")
  .item__title {{ title }}
  .item__check(v-if="checkValue"): .mdi.mdi-check-circle-outline
  .item__check(v-if="showCheckbox" @click.prevent="")
    Checkbox._small(v-model="checkboxValue")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.item
  cursor pointer
  display flex
  align-items center
  padding 0 $m6
  font-size 13px
  white-space nowrap

  @media $media-phone
    height 56px

  @media $media-laptop
    height 38px

  &:active
    background var(--c-bg-2)
    /.light-mode &
      background var(--c-bg-7)

  &:hover
    @media $media-laptop
      background var(--c-bg-2)
      /.light-mode &
        background var(--c-bg-7)

  &._selected
    background var(--c-bg-4)
    /.light-mode &
      background var(--c-bg-4)

  &__icon
    width 24px
    margin-right $m6
    font-size 18px
    text-align center
    opacity .85

  &__title
    color var(--c-font-3)

  &__check
    margin-left auto
    padding-left 32px
</style>
