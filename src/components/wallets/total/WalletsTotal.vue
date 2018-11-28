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
  .wallets-total__item
    .wallets-total__title Total
    .wallets-total__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.counted"
      )
  .wallets-total__item(v-if="totalInWallets.all > 0")
    .wallets-total__title Also
    .wallets-total__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.all"
      )
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.wallets-total
  display flex
  justify-content space-between
  padding $m8
  background var(--c-bg-6)

  @media $media-laptop
    background var(--c-bg-3)
    border-top 1px solid var(--c-bg-1)
    border-bottom 1px solid var(--c-bg-6)

  &__item
    margin-right $m9

    &:last-child
      margin-right 0

  &__title
    padding-bottom $m5
    color var(--c-font-4)
    fs-m()

  .amount .amount__wrap
    justify-content flex-start
</style>
