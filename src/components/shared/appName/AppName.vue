<template lang="pug">
.appName {{ $lang.appName }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"

.appName
  text-align center
  typo-appName()

  &:first-letter
    color var(--c-red-1)

  &:not(:first-child)
    margin-top $m9

    @media $media-laptop
      margin-top $mb1
</style>
