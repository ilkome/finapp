<script>
export default {
  props: {
    theme: {
      type: String,
      default: 'light'
    },

    size: {
      type: String,
      default: 'md'
    }
  },

  computed: {
    className () {
      return {
        _dark: this.theme === 'dark',
        [`_size_${this.size}`]: this.size
      }
    }
  }
}
</script>

<template lang="pug">
.spinner(:class="className")
  .spinner__b._b1
  .spinner__b._b2
  .spinner__b._b3
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"

.spinner
  display flex
  align-items center
  height 100%
  text-align center

  &._hidden
    visibility hidden

  &__b
    opacity .8
    display inline-block
    width 18px
    height 18px
    margin-right $m5
    border-radius 100%
    background-color var(--c-bg-10)
    animation sk-bouncedelay 1.3s infinite ease-in-out both

    ^[0]._size_lg &
      width 26px
      height 26px
      margin-right $m8

    ^[0]._dark &
      opacity 1
      background-color #067ab4

    &._b1
      animation-delay -0.32s

    &._b2
      animation-delay -0.16s

    &._b3
      margin-right 0

@keyframes sk-bouncedelay
  0%, 80%, 100%
    transform: scale(.2)
  40%
    transform: scale(1)
</style>
