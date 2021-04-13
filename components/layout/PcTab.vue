<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<template lang="pug">
transition(name="animation-tab")
  .layout-tab(v-show="show")
    slot
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"
.layout-tab
  .categories
    padding-bottom 0

  .categories__list
  .walletsTiles
    max-width 800px
    padding 0
    padding-bottom $m10
    grid-template-columns repeat(auto-fill, 160px)
    grid-column-gap $m8
    grid-row-gap $m8

    &:last-child
      padding-bottom $m10
</style>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/scroll"

.layout-tab
  z-index 2
  overflow hidden
  overflow-y auto
  position absolute
  left 0
  top 0
  width 100%
  height 100%
  padding 0
  background var(--c-bg-2)
  scrollbar()
</style>
