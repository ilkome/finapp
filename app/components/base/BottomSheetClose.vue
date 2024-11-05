<template>
  <div
    class="handlerClose hover:bg-item-6 size-8 rounded-full"
    @click="$emit('onClick')"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="3"
    >
      <path d="M0.75 23.249l22.5-22.5" />
      <path d="M23.25 23.249L0.75 0.749" />
    </svg>
  </div>
</template>

<style lang="stylus" scoped>
@import "../app/assets/stylus/variables/*"

.handlerClose
  z-index 3
  cursor pointer
  position absolute
  top 4px
  right 4px
  display flex
  align-items center
  justify-content center
  anim()

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
