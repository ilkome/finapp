<script>
import useMobileLayout from '~/components/layout/useMobileLayout'

export default {
  name: 'DateMobileSelector',

  setup () {
    const { showPeriodsNamesModal } = useMobileLayout()

    return {
      showPeriodsNamesModal
    }
  }
}
</script>

<template lang="pug">
.dateSelector
  .menuDots(@click="showPeriodsNamesModal")
    .menuDots__name: SharedDate(:type="2")
    .menuDots__dots: .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.dateSelector
  z-index 9
  position sticky
  top 0
  display flex
  align-items center
  justify-content center

.menuDots
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding $m6 $m8
  color var(--c-font-3)
  font-size 22px
  font-weight 500
  border-radius $m8
  anim()

  +media(600px)
    font-size 26px
    font-weight 600
    fontFamilyNunito()
    background none

  +media-hover()
    color var(--c-blue-1)

  &__dots
    margin-top -2px
    margin-right -5px
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px

    +media(600px)
      padding-left 6px
      font-size 22px
</style>
