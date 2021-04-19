<script>
export default {
  name: 'TrnFormHeader'
}
</script>

<template lang="pug">
.trnFormHeader(
  v-show="$store.state.trnForm.values.amountType !== 2"
)
  TrnFormHeaderItemWallet
  TrnFormHeaderItemCategory
</template>

<style lang="stylus">
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/animations'

.trnFormHeaderItem
  cursor pointer
  position relative
  flex-grow 1
  color var(--c-bg-5)
  border-radius $m5
  anim()

  &__dots
    position absolute
    top $m6
    right $m4
    color var(--c-font-2)
    font-size 16px
</style>

<style lang="stylus">
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.trnFormHeader
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m7
  grid-row-gap $m7
  padding 0 $m7
  padding-top 0
  padding-bottom $m9
</style>
