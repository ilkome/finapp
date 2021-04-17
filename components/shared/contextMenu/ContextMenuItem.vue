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
  .item__check(v-if="showCheckbox" @click.prevent="")
    SharedInputsCheckbox._small(v-model="checkboxValue")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.item
  cursor pointer
  display flex
  align-items center
  height 42px
  margin $m4 $m4
  padding 0 $m6
  font-size 13px
  white-space nowrap
  border-radius $m5

  @media $media-laptop
    height 38px

  +media-hover()
    &:not(._selected)
      background var(--c-bg-3)

  &._selected
    background var(--c-bg-5)

  &__icon
    opacity .85
    width 24px
    margin-right $m6
    font-size 18px
    text-align center

  &__title
    color var(--c-font-3)

  &__check
    margin-left auto
    padding-left 32px
</style>
