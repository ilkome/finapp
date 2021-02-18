<template lang="pug">
.appName {{ $t('appName') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/fonts'

.appName
  margin-bottom 20px
  color var(--c-font-2)
  fontFamilyNunito()
  font-size 66px
  font-weight 800
  letter-spacing 2px
  text-align center

  &:first-letter
    color var(--c-blue-3)

  &:not(:first-child)
    margin-top $m9

    @media $media-laptop
      margin-top $mb1
</style>
