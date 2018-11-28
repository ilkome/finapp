<template lang="pug" functional>
.appName Finapp Next
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"

.appName
  typo-appName()

  &:first-letter
    color var(--c-red-1)

  &:not(:first-child)
    margin-top $m9

    @media $media-laptop
      margin-top $mb1
</style>
