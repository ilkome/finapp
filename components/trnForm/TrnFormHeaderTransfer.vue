<script>
import Amount from '~/components/amount/Amount'

export default {
  components: {
    Amount
  },

  computed: {
    walletFromId () {
      return this.$store.state.trnForm.transfer.from || this.$store.getters['wallets/walletsSortedIds'][0]
    },
    walletFrom () {
      return this.$store.state.wallets.items[this.walletFromId]
    },
    walletToId () {
      return this.$store.state.trnForm.transfer.to || this.$store.getters['wallets/walletsSortedIds'][1]
    },
    walletTo () {
      return this.$store.state.wallets.items[this.walletToId]
    }
  },

  created () {
    this.$store.commit('trnForm/setTrnFormTransfer', {
      tranferType: 'from',
      walletId: this.walletFromId
    })
    this.$store.commit('trnForm/setTrnFormTransfer', {
      tranferType: 'to',
      walletId: this.walletToId
    })
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- Wallet from
  template(v-if="walletFrom")
    .trnFormHeader__item(
      :style="{ background: walletFrom.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')"
    )
      div
        .trnFormHeader__desc From wallet
        .trnFormHeader__name {{ walletFrom.name }}
        .trnFormHeader__total
          Amount(
            :value="$store.getters['wallets/walletsTotal'][walletFromId].base"
            :currency="$store.state.currencies.base"
          )

  //- Wallet to
  template(v-if="walletTo")
    .trnFormHeader__item(
      :style="{ background: walletTo.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
    )
      div
        .trnFormHeader__desc To wallet
        .trnFormHeader__name {{ walletTo.name }}
        .trnFormHeader__total
          Amount(
            :value="$store.getters['wallets/walletsTotal'][walletToId].base"
            :currency="$store.state.currencies.base"
          )
</template>

<style lang="stylus" scoped>
.trnFormHeader__desc
  color var(--c-font-2)
  font-size 12px
  margin-bottom 12px
  padding-bottom 6px
  border-bottom 1px solid var(--c-bg-10)
</style>
