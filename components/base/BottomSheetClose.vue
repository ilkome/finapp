<template lang="pug">
.handlerClose(@click="$emit('onClick')")
  svg(
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="3"
  )
    path(d="M.75 23.249l22.5-22.5")
    path(d="M23.25 23.249L.75.749")
</template>

<style lang="stylus" scoped>
.handlerClose
  z-index 3
  cursor pointer
  position absolute
  top 4px
  right 4px
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  border-radius 50%
  anim()

  +media-hover()
    background var(--c-blue-1)

  svg
    anim()
    width 12px
    height 12px
    stroke var(--c-font-4)

  +media-hover()
    svg
      width 12px
      height 12px
      stroke var(--c-font-1)
</style>
