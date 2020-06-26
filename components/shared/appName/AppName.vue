<template lang="pug">
.appName {{ $lang.appName }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"

.appName
  color var(--c-font-3)
  font-family "Nunito", "Roboto", sans-serif
  font-size 66px
  font-weight 800
  letter-spacing 2px
  text-align center
  margin-bottom 20px

  &:first-letter
    color #067ab4

  &:not(:first-child)
    margin-top $m9

    @media $media-laptop
      margin-top $mb1
</style>
