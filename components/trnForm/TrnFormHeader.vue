<script>
export default {
  name: 'TrnFormHeader'
}
</script>

<template lang="pug">
.trnFormHeader(
  v-show="this.$store.state.trnForm.values.amountType !== 2"
)
  TrnFormHeaderItemWallet
  TrnFormHeaderItemCategory
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/animations"

.trnFormHeaderItem
  position relative
  display flex
  flex-grow 1
  padding $m7 $m7
  color var(--c-bg-5)
  border-radius $m5
  anim()

  @media $media-laptop
    min-height 61px

  &__in
    ~/._category &
      display flex
      align-items center

  &__icon
    z-index 2
    margin-left -8px
    padding-right 4px

  &__total
    padding-top $m5

  &__name
    color var(--c-font-1)

    .parent
      font-size 12px
      padding-bottom $m2

    .child
      font-size 16px

  &__dots
    position absolute
    top $m6
    right $m4
    color var(--c-font-2)
    font-size 16px
</style>

<style lang="stylus">
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnFormHeader
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m7
  grid-row-gap $m7
  padding $m7
  padding-top 0

  /.light-mode &
    background var(--c-bg-2)
</style>
