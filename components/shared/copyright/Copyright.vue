<script>
export default {
  name: 'SharedCopyright'
}
</script>

<template lang="pug">
a.copyright.py-1.px-5.rounded-md(
  href="https://ilko.me"
  class="hocus:bg-white2 dark:hocus:bg-custom1"
)
  | {{ $t('app.madeBy.text') }}
  .copyright__heart.mdi.mdi-heart
  | {{ $t('app.madeBy.name') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.copyright
  display flex
  align-items center
  justify-content center
  text-decoration none

  &__heart
    display inline-flex
    margin 0 $m5
    color rgba(210, 0, 20, 1)
    font-size 28px
    animation heartbeat 3s ease-in-out infinite

@keyframes heartbeat
  0%
    transform scale(.75)
  20%
    transform scale(1)
  40%
    transform scale(.75)
  60%
    transform scale(1.1)
  80%
    transform scale(.75)
  100%
    transform scale(.75)
</style>
