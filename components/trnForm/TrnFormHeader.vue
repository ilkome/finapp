<script>
export default {
  name: 'TrnFormHeader',
}
</script>

<template lang="pug">
.px-3.pb-6.grid.grid-cols-2.gap-3(
  v-show="$store.state.trnForm.values.amountType !== 2"
)
  TrnFormHeaderItemWallet
  TrnFormHeaderItemCategory
</template>

<style lang="stylus">
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

    /.light &
      color var(--c-item-stat-icon)
</style>
