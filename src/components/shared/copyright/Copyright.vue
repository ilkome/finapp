<script>
export default {

}
</script>

<template lang="pug">
a(href="https://ilko.me").copyright
  | Made with
  .copyright__heart.mdi.mdi-heart
  | by Ilya Komichev
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/scrollbar"

.copyright
  display flex
  align-items center
  justify-content center
  padding $m6
  color var(--c-font-2)
  text-decoration none

  &__heart
    display inline-flex
    margin 0 $m5
    color rgba(210, 0, 20, 1)
    font-size $font-size-nb
    animation heartbeat 3s ease-in-out infinite

@keyframes heartbeat
  0%
    transform:scale(.75)
  20%
    transform:scale(1)
  40%
    transform:scale(.75)
  60%
    transform:scale(1.1)
  80%
    transform:scale(.75)
  100%
    transform:scale(.75)
</style>
