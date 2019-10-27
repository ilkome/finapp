<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

export default {
  components: { Amount, Icon },

  computed: {
    totalInWallets () {
      const walletsItems = this.$store.state.wallets.items
      const walletsTotal = this.$store.getters.walletsTotal
      let total = {
        counted: 0,
        all: 0
      }

      for (const walletId in walletsItems) {
        let walletTotal = 0
        if (walletsItems[walletId].currency === this.$store.state.currencies.base) {
          walletTotal = walletsTotal[walletId].base
        } else {
          walletTotal = this.$store.getters.getAmountInBaseCurrency({
            amount: walletsTotal[walletId].base,
            currency: walletsItems[walletId].currency
          })
        }

        if (walletsItems[walletId].countTotal) {
          total.counted = total.counted + walletTotal
        } else {
          total.all = total.all + walletTotal
        }
      }
      return total
    }
  }
}
</script>

<template lang="pug">
.wallets-total(v-if="$store.getters.hasWallets")
  .wallets-total__item(v-if="totalInWallets.all > 0")
    .wallets-total__title {{ $lang.money.also }}
    .wallets-total__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.all")

  .wallets-total__item
    .wallets-total__title {{ $lang.money.total }}
    .wallets-total__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.counted"
        :alwaysShowSymbol="true")

</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.wallets-total
  display flex
  justify-content space-between

  @media $media-laptop
    padding $m8
    background var(--c-bg-5)
    border-bottom 1px solid var(--c-bg-1)

  &__item
    margin-right $m9

    &:last-child
      margin-right 0

    &:nth-child(2)
      text-align right

  &__title
    padding-bottom $m5
    color var(--c-font-4)
    fs-m()

  .amount .amount__wrap
    justify-content flex-start
</style>
