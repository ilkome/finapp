<script>
export default {
  computed: {
    totalInWallets () {
      const walletsItems = this.$store.state.wallets.items
      const walletsTotal = this.$store.getters['wallets/walletsTotal']
      const total = {
        counted: 0,
        other: 0
      }

      for (const walletId in walletsItems) {
        let walletTotal = 0
        if (walletsItems[walletId].currency === this.$store.state.currencies.base) {
          walletTotal = walletsTotal[walletId].base
        }
        else {
          walletTotal = this.$store.getters['currencies/getAmountInBaseCurrency']({
            amount: walletsTotal[walletId].base,
            currency: walletsItems[walletId].currency
          })
        }

        walletsItems[walletId].countTotal
          ? total.counted = total.counted + walletTotal
          : total.other = total.other + walletTotal
      }
      return total
    }
  }
}
</script>

<template lang="pug">
.walletsTotal(
  v-if="$store.getters['wallets/hasWallets']"
)
  .walletsTotal__item(v-if="totalInWallets.other !== 0")
    .walletsTotal__title {{ $t('money.all') }}
    .walletsTotal__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.other + totalInWallets.counted"
        size="lg"
        vertical="center"
      )

  .walletsTotal__item
    .walletsTotal__title {{ $t('money.wallets') }}
    .walletsTotal__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.counted"
        size="lg"
        vertical="center"
      )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.walletsTotal
  display flex
  flex-wrap wrap
  align-items center
  justify-content center
  gap $m8
  padding 0 $m8
  padding-bottom $m8

  +media(600px)
    gap $m8
    padding 0 $m8
    padding-bottom $m8

  &__item
    flex 0 0 0
    align-self start
    justify-self start

  &__title
    opacity .6
    padding-right 0
    padding-bottom 6px
    font-size 12px
    text-align center
</style>
