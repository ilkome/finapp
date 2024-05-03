<template>
  <div
    class="handler hover_bg-item-5 transition rounded-xl"
  />
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

  &:after
    content ''
    display block
    width 32px
    height 4px
    background var(--c-bg-8)
</style>
