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
.grid.gap-y-1.gap-x-2.2sm_grid-cols-2.md_gap-x-6(
  v-if="$store.getters['wallets/hasWallets']"
)
  //- Credits
  .flex.items-center.bg.py-2.px-3.rounded-md(v-if="isShowCredits && totalInWallets.credits !== 0")
    .grow.text-sm.leading-none {{ $t('credits') }}
    Amount(
      :currency="$store.state.currencies.base"
      :value="totalInWallets.credits"
      vertical="right"
    )

  //- Savings
  .flex.items-center.bg.py-2.px-3.rounded-md(v-if="totalInWallets.savings !== 0 && isShowSavings")
    .grow.text-sm.leading-none {{ $t('savings') }}
    Amount(
      :currency="$store.state.currencies.base"
      :value="totalInWallets.savings"
      vertical="right"
    )

  //- Total
  .flex.items-center.bg.py-2.px-3.rounded-md
    .grow.text-sm.leading-none {{ $t('total') }}
    Amount(
      :currency="$store.state.currencies.base"
      :value="totalInWallets.counted + totalInWallets.savings - Math.abs(totalInWallets.credits)"
      vertical="right"
    )

  //- Avaliable
  .flex.items-center.bg.py-2.px-3.rounded-md(v-if="totalInWallets.counted !== totalInWallets.counted + totalInWallets.savings - Math.abs(totalInWallets.credits)")
    .grow.text-sm.leading-none {{ $t('avaliable') }}
    Amount(
      :currency="$store.state.currencies.base"
      :value="totalInWallets.counted"
      vertical="right"
    )
</template>

<style lang="stylus" scoped>
.bg
  background var(--c-item-bg-main)
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
