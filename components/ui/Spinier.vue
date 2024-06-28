<template>
  <div class="h-full flex-center">
    <div class="dot _d1" />
    <div class="dot _d2" />
    <div class="dot _d3" />
  </div>
</template>

<style lang="stylus" scoped>
.dot
  animation sk-bouncedelay 1.3s infinite ease-in-out both
  background-color var(--c-bg-10)
  @apply size-4 mr-3 rounded-full;

  &._d1
    animation-delay -0.32s

  &._d2
    animation-delay -0.16s

  &._d3
    margin-right 0

@keyframes sk-bouncedelay
  0%, 80%, 100%
    transform: scale(.2)
  40%
    transform: scale(1)
</style>
