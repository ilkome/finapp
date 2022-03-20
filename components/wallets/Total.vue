<script>
import useAmount from '~/components/amount/useAmount'

export default {
  props: {
    isShowCredits: { type: Boolean, default: false },
    isShowSavings: { type: Boolean, default: false },
  },

  setup() {
    const { getAmountInBaseCurrency } = useAmount()
    return { getAmountInBaseCurrency }
  },

  computed: {
    totalInWallets() {
      const walletsItems = this.$store.state.wallets.items
      const walletsTotal = this.$store.getters['wallets/walletsTotal']
      const total = {
        counted: 0,
        savings: 0,
        credits: 0,
      }

      for (const walletId in walletsItems) {
        let walletTotal = 0
        if (walletsItems[walletId].currency === this.$store.state.currencies.base) {
          walletTotal = walletsTotal[walletId].base
        }
        else {
          walletTotal = this.getAmountInBaseCurrency({
            amount: walletsTotal[walletId].base,
            currency: walletsItems[walletId].currency,
            noFormat: true,
          })
        }

        if (walletsItems[walletId].countTotal)
          total.counted = total.counted + walletTotal
        else if (walletsItems[walletId].isCredit)
          total.credits = total.credits + walletTotal
        else
          total.savings = total.savings + walletTotal
      }
      return total
    },
  },
}
</script>

<template lang="pug">
.walletsTotal(
  v-if="$store.getters['wallets/hasWallets']"
)
  //- Credits
  .walletsTotal__item(v-if="isShowCredits && totalInWallets.credits !== 0")
    .walletsTotal__title {{ $t('credits') }}
    .walletsTotal__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.credits"
        size="lg"
        vertical="center"
      )

  //- Savings
  .walletsTotal__item(v-if="totalInWallets.savings !== 0 && isShowSavings")
    .walletsTotal__title {{ $t('savings') }}
    .walletsTotal__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.savings"
        size="lg"
        vertical="center"
      )

  //- Total
  .walletsTotal__item
    .walletsTotal__title {{ $t('total') }}
    .walletsTotal__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.counted + totalInWallets.savings - Math.abs(totalInWallets.credits)"
        size="lg"
        vertical="center"
      )

  //- Avaliable
  .walletsTotal__item(v-if="totalInWallets.counted !== totalInWallets.counted + totalInWallets.savings - Math.abs(totalInWallets.credits)")
    .walletsTotal__title {{ $t('avaliable') }}
    .walletsTotal__value
      Amount(
        :currency="$store.state.currencies.base"
        :value="totalInWallets.counted"
        size="lg"
        vertical="center"
      )
</template>

<style lang="stylus" scoped>
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

<i18n lang="json5">
{
  "en": {
    "avaliable": "Avaliable",
    "credits": "Credits",
    "savings": "Savings",
    "total": "Total"
  },
  "ru": {
    "avaliable": "Доступные",
    "credits": "Кредиты",
    "savings": "Вложения",
    "total": "Всего"
  }
}
</i18n>
